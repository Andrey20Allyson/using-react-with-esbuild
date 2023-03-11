import http from 'http';
import fs from 'fs';
import fsp from 'fs/promises';

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

function createStaticHandler(cache) {
  
  /**@type {http.RequestListener} */
  async function staticHandler(req, res) {
    const { url = '/' } = req;
    const FILE_PATH = path.join(PUBLIC_DIR, url.at(-1) === '/' ? url + 'index.html' : url);

    try {
      const cached = cache.get(url);
      const fileStats = await fsp.stat(FILE_PATH);

      if (cached && cached.creation <= fileStats.mtimeMs) {
        sendDataTo(res, cached.data, 304);

        return;
      } else {
        const data = await fsp.readFile(FILE_PATH);

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
