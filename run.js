const RSS = require('./rss.js');

const CURRENT_DATE = new Date()

// TODO
//
// When running we want to fill all dates that are:
// 1. next date
// 2. any previous date
// 3. no date that already exists
//
// solved with iterating until the current date found

// TODO Handle rollover of date list
//
// New years to start: 30.12 04.01 30.01
// End to new years: 21.12 31.12 03.01 14.01
//
// Create function that takes a list of dates and creates
// real date objects. It should include logic for look-ahead
// to adress rollover.

async function getSite(url) {
  return fetch(url).then(async (resp) => {
    if (!resp.ok) {
      console.log("unable to fetch site");
      console.log(err);
      console.log(resp.status);
      console.log(resp.statusText);
      throw err;
    }

    return await resp.text();
  });
}

function getFullLocationName(text, key) {
  regexpLocation = new RegExp(`(${key}[\\w\\d\\søæå]*),`, "i");
  location = text.match(regexpLocation);

  // TODO null handle
  
  return location[1]
}

function getTimeForLocation(text, location) {
  regexpTime = new RegExp(`${location}, (kl (\\d+:\\d+) &#8211; (\\d+:\\d+))`, "i");
  times = text.match(regexpTime);
  console.log(times[2], times[3])

  // TODO null handle

  from = times[2];
  to = times[3];
  return [from, to];
}

function getDatesForLocation(text, location) {
  regexpDatesString = new RegExp(`${location}.*<br>((\\d+.\\d+).*)</p>`, "i");
  datesString = text.match(regexpDatesString)[0];

  // only care about first paragraph
  // TODO make regex stop at first capture
  datesString = datesString.split('</p>')[0]

  // TODO null check

  regexpDates = /(\d+\.\d+)+/g
  dates = datesString.match(regexpDates)

  // TODO null check

  return dates
}

function getSolberg(site, TITLE) {
  const name = getFullLocationName(site, TITLE)
  const [from, to] = getTimeForLocation(site, name);
  const dates = getDatesForLocation(site, TITLE);

  return { name, times: { from, to }, dates };
}

// convert string DD.MM to JS date object
function websiteDateToTime(dateString) {
  const date = new Date()
  let [_, day, month] = dateString.match(/(\d+).(\d+)/)
  day = Number(day)
  month = Number(month)

  date.setMonth(Number(month - 1))
  date.setDate(Number(day))
  // console.log({day, month})
  // console.log('prev:', date <= CURRENT_DATE)
  // console.log('futr:', date > CURRENT_DATE)

  return date
}

// convert JS date object to DD.MM string
function timeToWebsiteDate(date) {
  const day = date.getDate()
  const month = date.getMonth() + 1

  const pad = (n) => String(n).padStart(2, '0')

  return `${pad(day)}.${pad(month)}`
}

function relevantDates(allDates) {
  const relevantDates = []
  let index = 0;
  let date = 0

  // this selects all dates before current date AND the
  // next one since index incrementation is after push
  while (date <= CURRENT_DATE) {
    date = websiteDateToTime(allDates[index])

    relevantDates.push(timeToWebsiteDate(date))
    index = index + 1;
  }

  return relevantDates
}

// fetch websites
// parse for name, time and dates
// convert to JS dates
// parse RSS feed
// convert to JS dates
// add dates not in feed
// write feed

async function main() {
  const URL = "https://folloren.no/levering-av-avfall/miljobilen"
  site = await getSite(URL);

  console.log("got site:", site?.length || -1);
  const PLACE = 'Langhus'
  location = getSolberg(site, PLACE)

  console.log(location)

  let { name, times, dates } = location;
  // dates[0] = '30.12'
  dates.push('11.05')
  dates.push('12.05')
  dates.push('13.05')
  console.log("all dates:", dates)

  // todo relevant dates elsewhere
  dates = relevantDates(dates)
  console.log("rel dates:", dates)
  const rss = new RSS(name);
  rss.generate(times, dates, URL)
  rss.write()
}

try {
  main();
} catch (err) {
  console.log("something went wront when runnning script");
  console.log(err);
}

