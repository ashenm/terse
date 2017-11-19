/**
 * Utility Functions
 *
 * Ashen Gunaratne
 * mail@ashenm.ml
 *
 */

const utilities = {

  /**
   * Flush `data` to `stream` and end response cycle
   * with corresponding response header for `status`
   */
  respond(stream, status, data) {
    stream.writeHead(status);
    stream.end(data || stream.statusMessage);
  },

  /**
   * Write `shortURL` and `longURL`
   * in JSON and terminate `stream`
   */
  dispatch(stream, shortURL, longURL, host = '') {
    utilities.respond(stream, 200, JSON.stringify({
      shortURL: `${host}/${shortURL}`,
      longURL: longURL
    }));
  },

  /**
   * Initiate URL shortening
   * and response accordingly
   */
  condense(stream, app, url, host) {
    app.put(url, (error, shortURL) => {
      error
        ? utilities.respond(stream, 500)
        : utilities.dispatch(stream, shortURL, url, host);
    });
  },

  /**
   * Initiate URL expansion
   * and response accordingly
   */
  elongate(stream, app, url, host) {
    app.get(url, (error, row) => {
      if (error) {
        utilities.respond(stream, 500);
      } else if (!row) {
        utilities.respond(stream, 400, 'Invalid URL');
      } else {
        utilities.dispatch(stream, url, row.url, host);
      }
    });
  },

  /**
   * Redirect user-agent to expanded URL
   */
  redirect(stream, app, url) {
    app.get(url, (error, row) => {
      if (error) {
        utilities.respond(stream, 500);
      } else if (!row) {
        utilities.respond(stream, 400, 'Invalid URL');
      } else {
        stream.setHeader('Location', row.url);
        utilities.respond(stream, 301);
      }
    });
  },

  /**
   * Self-terminate process signaling
   * keyboard interrupt and log any errors
   */
  kill(error) {
    if (error)
      console.error(error);
    process.exit(128);
  }

};

module.exports = utilities;