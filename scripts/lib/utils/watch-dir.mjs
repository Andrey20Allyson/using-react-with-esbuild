import fs from 'fs';
import { debounce } from './index.mjs';

/**
 * 
 * @param {string} path 
 * @param {(fileName: string) => void} changeListener
 */
export default function watchDir(path, changeListener) {
  const watcher = fs.watch(path);

  /**
   * 
   * @param {string} eventName 
   * @param {string} fileName 
   */
  function baseHandler(eventName, fileName) {
    changeListener(fileName);
  }

  const handler = debounce(baseHandler, 400);

  watcher.on('change', handler);

  function end() {
    watcher.removeAllListeners();
    watcher.close();
  }

  return { end };
} 