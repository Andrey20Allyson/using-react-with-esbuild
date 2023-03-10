import http from 'http';
import fs from 'fs';
import fsp from 'fs/promises';
import os from 'os';
import path from 'path';

let networkIP;
const interfaces = os.networkInterfaces();

for (let key in interfaces) {
  let ip = interfaces[key][1].address;
  if (ip) {
    networkIP = ip;
    break;
  } else {
    throw Error('Can\'t find a network ip');
  }
}
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PUBLIC_FILES = fs.readdirSync(PUBLIC_DIR);

/**@type {Map<string, http.RequestListener>} */
const routes = new Map();
/**@type {Map<string, string>} */
const cache = new Map();

/**@type {http.RequestListener} */
function notFoundHandler(req, res) {
  res.setHeader('Content-Type', 'text/text');
  res.write('Error 404');
  res.statusCode = 404;
  res.end();
  return;
}

/**
 * 
 * @param {any} data 
 * @param {http.ServerResponse} res
 * @param {number} code 
 */
function sendDataTo(res, data, code) {
  res.write(data);
  res.statusCode = code;
  res.end();
}

/**@type {http.RequestListener} */
async function staticHandler(req, res) {
  const { url = '/' } = req;
  const FILE_PATH = path.join(PUBLIC_DIR, url.at(-1) === '/' ? url + 'index.html' : url);

  try {
    const cached = cache.get(url);

    if (cached) {
      sendDataTo(res, cached, 304);
      return;
    } else {
      const data = await fsp.readFile(FILE_PATH);

      sendDataTo(res, data, 200);
      return;
    }
  } catch (e) {
    console.log(e);
    notFoundHandler(req, res);
    return;
  }
}

for (const file of PUBLIC_FILES) {
  const url = '/' + (file.endsWith('index.html') ? file.replace('index.html', '') : file); 

  routes.set(url, staticHandler);
}

/**@type {http.RequestListener} */
function requestHandler(req, res) {
  const handler = routes.get(req.url ?? '/');

  if (handler) {
    handler(req, res);
  } else {
    notFoundHandler(req, res);
  }

  return;
}

const server = http.createServer(requestHandler);
const PORT = 8080;

server.listen(PORT, 'localhost');
server.listen(PORT, networkIP, () => {
  console.log(`[server is listening]\n  http://localhost:${PORT}\n  http://${networkIP}:${PORT}`);
});