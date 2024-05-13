const fs = require('fs')

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

function writeStringToFile(filePath, content) {
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error(`Error writing to ${filePath}:`, err);
        } else {
            console.log(`Successfully wrote to ${filePath}`);
        }
    });
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

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
  console.log(text.match(regexpDatesString))

  // only care about first paragraph
  console.log("datestring", datesString)
  datesString = datesString.split('</p>')[0]

  // TODO null check

  console.log("datestring", datesString)

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

function formatRSSDate(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const day = days[date.getUTCDay()];
  const dayOfMonth = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${day}, ${dayOfMonth} ${month} ${year} ${hours}:${minutes}:${seconds} +0000`;
}

function generateRSS(name, times, dates, URL) {
  const description = "Viser hentetider for miljøbilen fra folloren.no"
  const updatedDate = formatRSSDate(new Date())

  const blocks = dates.reverse().map((date, n) => {
    const relativeDate = new Date().getTime() - (n * 100000000)
    const time = formatRSSDate(new Date(relativeDate))

    return `
 <item>
  <title></title>
  <description>Vi minner om miljøbilen fra FolloRen besøker oss på ${name} kl ${times.from}-${times.to} den ${date}.</description>
  <link>${URL}</link>
  <guid isPermaLink="false">${uuidv4()}</guid>
  <pubDate>${time}</pubDate>
 </item>
    `
  })

  return `
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
 <title>Miljøbilen hentetider ${name}</title>
 <description>${description}</description>
 <link>https://github.com/kevinmidboe/miljobilen-rss</link>
 <copyright>2020 Example.com All rights reserved</copyright>
 <lastBuildDate>${updatedDate}</lastBuildDate>
 <pubDate>${updatedDate}</pubDate>
 <ttl>1800</ttl>

  ${blocks.join('')}

</channel>
</rss>
  `
}

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

  while (date <= CURRENT_DATE) {
    date = websiteDateToTime(allDates[index])

    relevantDates.push(timeToWebsiteDate(date))
    index = index + 1;
  }

  return relevantDates
}

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
  rss = generateRSS(name, times, dates, URL)
  writeStringToFile('rss.xml', rss)
}

try {
  main();
} catch (err) {
  console.log("something went wront when runnning script");
  console.log(err);
}

