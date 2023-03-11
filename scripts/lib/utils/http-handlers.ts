import { IncomingMessage, ServerResponse } from 'http';
import fsp from 'fs/promises';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

function notFoundHandler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'text/text');
  res.write('Error 404');
  res.statusCode = 404;
  res.end();
  return;
}

export type CacheValue = {
  data: string,
  creation: number,
} 

function sendDataTo(res: ServerResponse, data: any, code: number) {
  res.write(data);
  res.statusCode = code;
  res.end();
}

function createStaticHandler(cache: Map<string, CacheValue>) {
  async function staticHandler(req: IncomingMessage, res: ServerResponse) {
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

  return staticHandler;
}
