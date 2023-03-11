import fs from 'fs';
import { debounce } from './index.js';

type WatchControler = {
  end: () => void;
};
type ChangeListener = (fileName: string) => void;

export default function watchDir(path: string, changeListener: ChangeListener): WatchControler {
  const watcher = fs.watch(path);

  function baseHandler(eventName: string, fileName: string) {
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