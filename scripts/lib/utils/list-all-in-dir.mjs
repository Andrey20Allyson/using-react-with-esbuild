import fs from 'fs/promises';
import _path from 'path';

/**
 * 
 * @param {string} path 
 */
export async function listAllFiles(path) {
  const _files = await fs.readdir(path);

  /**@type {string[]} */
  const files = [];

  for (const file of _files) {
    const fullPath = _path.join(path, file);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      const _files = await listAllFiles(fullPath);

      for (const file of _files) {
        files.push(file);
      }
    } else {
      files.push(fullPath);
    }
  }

  return files;
}