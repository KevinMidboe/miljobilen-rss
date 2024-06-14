const RSS = require("./rss.js");
const {
  CURRENT_DATE,
  websiteDateToTime,
  validateArguments,
  timeToWebsiteDate,
} = require("./utils.js");
const {
  WebsiteRedirectedURLError,
  WebsiteNotFoundError,
  WebsiteUnexpectedError,
  LocationNotFoundError,
  TimesNotFoundError,
  DatesNotFoundError,
} = require("./errors.js");

const URL = "https://folloren.no/levering-av-avfall/miljobilen/";

/**
 * Get HTML text content from url.
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<string>}
 */
async function getSite(url, options = { redirect: "manual" }) {
  return fetch(url, options)
    .catch((err) => {
      throw new WebsiteUnexpectedError(err.message, url);
    })
    .then(async (resp) => {
      if (resp.ok) {
        return await resp.text();
      }

      if (resp.status === 301) throw new WebsiteRedirectedURLError(resp, url);
      throw new WebsiteNotFoundError(resp, url);
    });
}

/**
 * Searches HTML response with regexp looking for location name.
 * @param {string} text
 * @param {string} key
 * @returns {string}
 * @throws {LocationNotFoundError} If unable to match using regexp
 */
function getFullLocationName(text, key) {
  const regexpLocation = new RegExp(`(${key}[\\w\\d\\søæå]*),`, "i");
  const location = text?.match(regexpLocation);

  if (location == null || location?.length < 2)
    throw new LocationNotFoundError(key, location);

  return location[1];
}

/**
 * Searches HTML response with regexp looking for times.
 * @param {string} text
 * @param {string} location
 * @returns {Array.<string>}
 * @throws {TimesNotFoundError} If unable to match using regexp
 */
function getTimeForLocation(text, location) {
  const regexpTime = new RegExp(
    `${location}, (kl (\\d+:\\d+) &#8211; (\\d+:\\d+))`,
    "i"
  );
  const times = text?.match(regexpTime);

  if (times == null || times?.length < 4)
    throw new TimesNotFoundError(location, times);

  const from = times[2];
  const to = times[3];
  return [from, to];
}

/**
 * Searches HTML response with regexp looking for dates.
 * @param {string} text
 * @param {string} location
 * @returns {Array.<string>}
 * @throws {DatesNotFoundError} If unable to match using regexp
 */
function getDatesForLocation(text, location) {
  const regexpDatesString = new RegExp(
    `${location}.*<br>((\\d+.\\d+).*)</p>`,
    "i"
  );
  let datesStringMatches = text.match(regexpDatesString);

  if (datesStringMatches == null || datesStringMatches?.length === 0)
    throw new DatesNotFoundError(location, datesStringMatches);

  // only care about first paragraph
  // TODO make regex stop at first capture
  const datesString = datesStringMatches?.[0]?.split("</p>")?.[0];

  const regexpDates = /(\d+\.\d+)+/g;
  const dates = String(datesString)?.match(regexpDates);

  if (dates == null || dates?.length === 0)
    throw new DatesNotFoundError(location, dates);

  /*
  dates.push('25.06')
  dates.push('02.02')
  dates.push('07.04')
  dates.push('07.05')
  */
  return dates;
}

/**
 * Since webpage only has DD.MM dates we want to handle
 * passing from one year to the next correctly
 * @param {Array.<Date>} dates
 * @returns {Array.<Date>}
 */
function handleDatesWrappingNewYear(dates) {
  let previousDate = dates[0];
  return dates.map((date) => {
    // increments year if a date is found to be wrapping
    if (date < previousDate) {
      date.setFullYear(date.getFullYear() + 1);
    }

    previousDate = date;
    return date;
  });
}

/**
 * Searches for name, times and dates in HTML text response.
 * @param {string} site
 * @param {string} TITLE
 * @returns {import('./types.js').Location}
 */
function getPickupDatesForLocation(site, TITLE) {
  const name = getFullLocationName(site, TITLE);
  const [from, to] = getTimeForLocation(site, name);
  const dateStrings = getDatesForLocation(site, TITLE);
  const dates = dateStrings.map(websiteDateToTime);

  handleDatesWrappingNewYear(dates);

  return { name, times: { from, to }, dates, dateStrings };
}

/**
 * Filters out only the dates we want in RSS feed.
 * @param {Array.<Date>} dates
 * @param {number} LOOK_AHEAD
 * @returns {Array.<Date>}
 */
function relevantDates(dates, LOOK_AHEAD) {
  let futureDatesFound = 0;

  return dates.filter((date) => {
    if (date > CURRENT_DATE) futureDatesFound = futureDatesFound + 1;
    if (futureDatesFound > LOOK_AHEAD) return undefined;

    return date;
  });
}

async function main() {
  const PLACE = process.argv[2];
  const LOOK_AHEAD = process.argv[3] || 2;
  const PRINT = process.argv[4] === '-p' || false;
  validateArguments(PLACE, LOOK_AHEAD);

  const site = await getSite(URL);
  const location = getPickupDatesForLocation(site, PLACE);
  // console.log(location);

  let { name, times, dates } = location;
  dates = relevantDates(dates, Number(LOOK_AHEAD));

  if (PRINT) {
    console.log(
      `${name} @ ${times.from}-${times.to}, dates found: ${dates.length}`
    );
    console.log(dates.map(timeToWebsiteDate));
  }

  const rss = new RSS(name);
  rss.generate(times, dates, URL);
  rss.write();
}

main();
