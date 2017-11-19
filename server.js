/**
 * URL Shortener Microservice
 *
 * Ashen Gunaratne
 * mail@ashenm.ml
 *
 */

const terse = require('./terse');
const utils = require('./utilities');
const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

const app = new terse(path.join(__dirname, '.data', 'terse.db'));

http.createServer((request, response) => {

  const pURL = url.parse(request.url);

  // route /terse/:url
  if (/^\/terse\//.test(pURL.pathname)) {
    const match = /(?:\w{1,}:\/\/)?(?:\w{1,}\.)?\w{1,}\.\w{1,}.{0,}/.exec(pURL.path);
    match
      ? utils.condense(response, app, match.toString(), pURL.protocol + pURL.host)
      : utils.respond(response, 400, 'Invalid URL');
    return;
  }

  // route /verbose/:url
  if (/^\/verbose\//.test(pURL.pathname)) {
    const match = /[0-9A-Za-z]{1,}$/.exec(pURL.pathname.replace(/^\/verbose\//, ''));
    match
      ? utils.elongate(response, app, match.toString(), pURL.protocol + pURL.host)
      : utils.respond(response, 400, 'Invalid URL');
    return;
  }

  // route /:url
  if (/^\/[0-9A-Za-z]{1,}$/.test(pURL.pathname)) {
    const match = /[0-9A-Za-z]{1,}$/.exec(pURL.pathname.replace(/^\//, ''));
    match
      ? utils.redirect(response, app, match.toString())
      : utils.respond(response, 400, 'Invalid URL');
    return;
  }

  // route /
  if (/^\/$/.test(pURL.pathname)) {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream(path.join(__dirname, 'public', 'index.html')).pipe(response);
    return;
  }

  // favicon
  if (/^\/favicon\.ico$/.test(pURL.pathname)) {
    response.writeHead(404);
    response.end(null);
    return;
  }

  // redirect any exceptions to webroot
  response.writeHead(301, {'Location': '/'});
  response.end(null);

}).listen(process.env.PORT || 8080);

// flush database on CTRL+C
process.on('SIGINT', () => app.terminate(utils.kill));
