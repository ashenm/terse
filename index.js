/**
 * index.js
 * https://github.com/ashenm/terse
 *
 * Ashen Gunaratne
 * mail@ashenm.ml
 *
 */

const fs = require('fs');
const http = require('http');
const url = require('url');

const routes = JSON.parse(fs.readFileSync('routes.json', 'utf8'))
  .reduce((collection, route) => Object.assign(collection, { [ '/'.concat(route.path) ]: route }), {});

http.createServer((request, response) => {

  const pURL = url.parse(request.url, false, false);

  // only allow GET requests
  if (!/GET/.test(request.method)) {
    response.writeHead(405, { 'Content-Type': 'text/plain' });
    response.end(response.statusMessage);
    return;
  }

  // handle webroot
  if (/^\/$/.test(pURL.pathname)) {
    response.writeHead(202, { 'Content-Type': 'text/plain' });
    response.end(response.statusMessage);
    return;
  }

  // TODO handle favicon requests
  if (/^\/favicon\.ico$/.test(pURL.pathname)) {
    response.writeHead(404);
    response.end(null);
    return;
  }

  // handle non-existence paths
  if (!routes[pURL.pathname]) {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end(response.statusMessage);
    return;
  }

  // handle url expansion retrieval
  if (/\bverbose\b/.test(pURL.query)) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ longUrl: routes[pURL.pathname].url }));
    return;
  }

  // handle url redirection
  response.writeHead(303, { 'Location': routes[pURL.pathname].url });
  response.end(null);

}).listen(process.env.PORT || 8080);

// vim: set expandtab shiftwidth=2 syntax=javascript:
