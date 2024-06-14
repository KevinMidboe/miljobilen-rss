/**
 * @typedef {Object} CustomRegexType
 * @property {number} inputLength
 *
 * @typedef {RegExpMatchArray & CustomRegexType} CustomRegExpMatchArray
 */

class WebsiteNotFoundError extends Error {
  /**
   * @param {Response} resp
   * @param {string} url
   */
  constructor(resp, url) {
    const { status, statusText } = resp;

    const message = `Unable to fetch data from website, responded with status code: ${status}.`;
    super(message)

    this.status = status;
    this.statusText = statusText;
    this.url = url;
  }
}

class WebsiteRedirectedURLError extends Error {
  /**
   * @param {Response} resp
   * @param {string} url
   */
  constructor(resp, url) {
    const message = 'Server responded with redirect, check URL for errors.'
    super(message)

    const { status, statusText, headers } = resp;
    this.status = status;
    this.statusText = statusText;
    this.location = headers.get('Location');
    this.url = url;
  }
}

class WebsiteUnexpectedError extends Error {
  /**
   * @param {string} errorMessage
   * @param {string} url
   */
  constructor(errorMessage, url) {
    const message = 'Unexpected error occured! Unable to fetch date from website.';
    super(message);

    this.errorMessage = errorMessage;
    this.url = url;
  }
}

class LocationNotFoundError extends Error {
  /**
   * @param {string} location
   * @param {RegExpMatchArray | null} matched
   */
  constructor(location, matched) {
    const message = `Pick up location: '${location}' not found on folloren.no website.`;
    super(message)
    
    if (matched?.input) {
      // matched.inputLength = matched.input?.length
      delete matched.input
    }

    this.foundMatch = matched
    this.name = 'LocationNotFoundError';
  }
}

class TimesNotFoundError extends Error {
  /**
   * @param {string} location
   * @param {RegExpMatchArray | null} matched
   */
  constructor(location, matched) {
    const message = `Times for location: '${location}' not found on folloren.no website.`;
    super(message)

    if (matched?.input) {
      // matched.inputLength = matched.input?.length
      delete matched.input
    }

    this.foundMatch = matched
    this.name = 'TimesNotFoundError';
  }
}

class DatesNotFoundError extends Error {
  /**
   * @param {string} location
   * @param {RegExpMatchArray | null} matched
   */
  constructor(location, matched) {
    const message = `Dates for location '${location}' not found on folloren.no website.`;
    super(message)
   
    if (matched?.input) {
      // matched.inputLength = matched.input?.length
      delete matched.input
    }

    this.foundMatch = matched 
    this.name = 'DatesNotFoundError';
  }
}

module.exports = {
  WebsiteNotFoundError,
  WebsiteRedirectedURLError,
  WebsiteUnexpectedError,
  LocationNotFoundError,
  TimesNotFoundError,
  DatesNotFoundError
}
