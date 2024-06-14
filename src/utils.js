const CURRENT_DATE = new Date();
const HELP_TEXT = `\
usage: node src/run.js <name> [<look-ahead>] [-p] [-h | --help]

These are the available arguments:
    name        Name of location to search for
    look-ahead  How many days in future to generate, defaults 2
    print       Prints results
    help        Prints this message`;

/**
 * Converts string DD.MM to JS date object.
 * @param {string} dateString
 * @returns {Date}
 */
function websiteDateToTime(dateString) {
  const date = new Date();
  const dayAndMonthString = dateString?.match(/(\d+).(\d+)/);

  if (dayAndMonthString == null || dayAndMonthString.length < 3)
    throw new Error("Unable to created string from unparsable date.");

  const day = Number(dayAndMonthString[1]);
  const month = Number(dayAndMonthString[2]);

  date.setMonth(Number(month - 1));
  date.setDate(Number(day));

  return date;
}

/**
 * Converts JS date object to DD.MM(.YY) string
 * @param {Date} date
 * @returns {string}
 */
function timeToWebsiteDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  /**
   * @param {string | number} n
   */
  const pad = (n) => String(n).padStart(2, "0");

  // adds year if showing next years date
  if (year > CURRENT_DATE.getFullYear())
    return `${pad(day)}.${pad(month)}.${pad(year - 2000)}`;
  else return `${pad(day)}.${pad(month)}`;
}

/**
 * Prints help and validates argv
 * @param {string} place
 * @param {number | string} lookAhead
 * @throws Error
 */
function validateArguments(place, lookAhead) {
  const placeUndefined = place === undefined;
  const help = (place === "-h" || place === "--help")
  const numberIsNotNumber = isNaN(Number(lookAhead))
  const validation = [placeUndefined, help, numberIsNotNumber]

  if (!validation.every(v => v === false)) {
    console.log(HELP_TEXT);
    process.exit(0);
  }
}

module.exports = {
  CURRENT_DATE,
  websiteDateToTime,
  timeToWebsiteDate,
  validateArguments,
};
