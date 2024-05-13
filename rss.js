const fs = require('fs')
const { uuidv4 } = require('./utils')

class RSS {

  constructor(name) {
    this.name = name;
    this.filename = 'rss.xml';
    this.feed = null;

    this.read()
  }

  // reads RSS file
  read() {
    fs.readFile(this.filename, 'utf8', (err, content) => {
      if (err) {
        console.error("Unable to read file:", this.filename)
        console.error(err);
        return;
      }

      this.feed = content;
    });

  }

  // writes RSS file
  write(content=this.feed) {
    fs.writeFile(this.filename, content, (err) => {
      if (err) {
          console.error(`Error writing to ${this.filename}:`, err);
      } else {
          console.log(`Successfully wrote to ${this.filename}`);
      }
    });
  }

  itemTemplate(times, date, url, n) {
    const relativeDate = new Date().getTime() - (n * 100000000)
    const time = this.formatDate(new Date(relativeDate))
    // const currentRSSDate = this.formatDate(new Date());

    return `
 <item>
  <title></title>
  <description>Vi minner om miljøbilen fra FolloRen besøker oss på ${this.name} kl ${times.from}-${times.to} den ${date}.</description>
  <link>${url}</link>
  <guid isPermaLink="false">${uuidv4()}</guid>
  <pubDate>${time}</pubDate>
 </item>

    `;
  }

  getRSSItems() {

  }

  generate(times, dates, url) {
    const description = "Viser hentetider for miljøbilen fra folloren.no";
    const currentRSSDate = this.formatDate(new Date())

    const blocks = dates.reverse().map((date, n) => this.itemTemplate(times, date, url, n))
    this.feed = `
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
 <title>Miljøbilen hentetider ${this.name}</title>
 <description>${description}</description>
 <link>https://github.com/kevinmidboe/miljobilen-rss</link>
 <copyright>2020 Example.com All rights reserved</copyright>
 <lastBuildDate>${currentRSSDate}</lastBuildDate>
 <pubDate>${currentRSSDate}</pubDate>
 <ttl>1800</ttl>

  ${blocks.join('')}

</channel>
</rss>
    `;
  }

  formatDate(date) {
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
}


module.exports = RSS
