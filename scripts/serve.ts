import http from 'http';
import fs from 'fs';
import fsp from 'fs/promises';
import os from 'os';
import path from 'path';
import { getFirstIPv4 } from './lib/utils/network';
import { startSync } from './lib/utils/start-env';

startSync();

let networkIP = getFirstIPv4();

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PUBLIC_FILES = fs.readdirSync(PUBLIC_DIR);

type CacheValue = {
  data: string,
  creation: number,
} 

const routes = new Map<string, http.RequestListener>();
const cache = new Map<string, CacheValue>();

function notFoundHandler(req: http.IncomingMessage, res: http.ServerResponse) {
  res.setHeader('Content-Type', 'text/text');
  res.write('Error 404');
  res.statusCode = 404;
  res.end();
  return;
}

function sendDataTo(res: http.ServerResponse, data: any, code: number) {
  res.write(data);
  res.statusCode = code;
  res.end();
}

async function staticHandler(req: http.IncomingMessage, res: http.ServerResponse) {
  const { url = '/' } = req;
  const FILE_PATH = path.join(PUBLIC_DIR, url.at(-1) === '/' ? url + 'index.html' : url);

  try {
    const cached = cache.get(url);
    const fileStats = await fsp.stat(FILE_PATH);

    if (cached && cached.creation <= fileStats.mtimeMs) {
      sendDataTo(res, cached.data, 304);

      return;
    } else {
      const data = await fsp.readFile(FILE_PATH, { encoding: 'utf-8' });

      sendDataTo(res, data, 200);

      cache.set(url, {
        creation: Date.now(),
        data,
      });

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

function requestHandler(req: http.IncomingMessage, res: http.ServerResponse) {
  const handler = routes.get(req.url ?? '/');

  if (handler) {
    handler(req, res);
    return;
  } else {
    notFoundHandler(req, res);
    return;
  }
}

const server = http.createServer(requestHandler);
const PORT = 8080;

console.log('Initializing Development Server...');

server.listen(PORT, 'localhost');
server.listen(PORT, networkIP, () => {
  console.log(`[server is listening]\n  Local: http://localhost:${PORT}\n  Network: http://${networkIP}:${PORT}`);
});