import esbuild, { buildSync } from 'esbuild';
import fs from 'fs';
import chalk from 'chalk';
import { debounce } from './lib/utils/index.mjs';

const [WATCH_MODE, DEV_MODE] = [/watch/, /dev/].map(regexp => process.argv.some(v => regexp.test(v)));
const ENDL = '\n\r';

const OUT_FILE = 'public/bundle.js';

/**@type {esbuild.BuildOptions} */
const options = {
  tsconfig: 'tsconfig.json',
  entryPoints: [
    'src/index.tsx'
  ],
  bundle: true,
  outfile: OUT_FILE,
  metafile: true,
  minify: !DEV_MODE,
  sourcemap: DEV_MODE,
};

function bundle() {
  const result = buildSync(options);

  return result
}

const formater = Intl.NumberFormat('pt-br', {
  style: 'decimal',
  useGrouping: true,
  minimumFractionDigits: 0
});

/**
 * 
 * @param {esbuild.BuildResult<esbuild.BuildOptions>} result 
 */
function showBundleResult(result) {
  const outputData = result.metafile?.outputs?.[OUT_FILE];

  if (outputData) {
    const bundleSize = formater.format(outputData.bytes);

    process.stdout.cursorTo(0, 0);
    process.stdout.clearScreenDown();

    console.log(
      `[${chalk.whiteBright('bundle info')}]:` + ENDL +
      `  bundled with ${chalk.greenBright('success')} packages` + ENDL +
      Object.entries(result.metafile.inputs)
        .map(([k, v]) => `    ${k} - ${chalk.blueBright('size:')} ${formater.format(v.bytes)} ${chalk.blueBright('Bytes')}`)
        .join(ENDL) + ENDL +
      `  ${chalk.yellowBright('bundle size:')} ${bundleSize} ${chalk.yellowBright('Bytes')}`
    );
  }
}

if (WATCH_MODE) {
  const watcher = fs.watch('src');

  const result = bundle();

  showBundleResult(result);

  /**@type {(eventName: string, fileName: string) => void} */
  function watchHandler(eventName, fileName) {
    const result = bundle();

    showBundleResult(result);
  }

  const handler = debounce(watchHandler, 500);

  watcher.on('change', handler);
} else {
  const result = bundle();

  showBundleResult(result);
}




