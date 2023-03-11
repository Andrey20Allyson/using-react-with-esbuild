import fs from 'fs/promises';
import _path from 'path';

export async function listAllFiles(path: string) {
  const _files = await fs.readdir(path);

  const files: string[] = [];

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