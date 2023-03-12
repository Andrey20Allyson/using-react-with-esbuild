import { IncomingMessage, ServerResponse } from 'http';
import fsp from 'fs/promises';
import _path from 'path';

export type CacheValue = {
  data: string,
  creation: number,
}

export type PageCache = Map<string, CacheValue>;
export type StaticPageRequestHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

export interface StaticPagesConfig {
  path?: string;
  cache?: PageCache;
}

export interface StaticPages {
  handler: StaticPageRequestHandler;
  cache: PageCache;
}

export function sendDataTo(res: ServerResponse, data: any, code: number) {
  res.setHeader('Content-Type', 'text/html');
  res.write(data);
  res.statusCode = code;
  res.end();
}

function notFoundHandler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'text/text');
  res.write('Error 404');
  res.statusCode = 404;
  res.end();
  return;
}

export function createStaticPages(config: StaticPagesConfig = {}): StaticPages {
  const {
    cache = new Map() as PageCache,
    path = '.',
  } = config;

  async function handler(req: IncomingMessage, res: ServerResponse) {
    const { url = '/' } = req;
    const FILE_PATH = _path.join(path, url.at(-1) === '/' ? url + 'index.html' : url);

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

  return {
    cache,
    handler
  };
}
