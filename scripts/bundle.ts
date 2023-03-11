import esbuild from 'esbuild';
import fs from 'fs';
import chalk from 'chalk';
import { debounce } from './lib/utils/index.js';

const [WATCH_MODE, DEV_MODE] = [/watch/, /dev/].map(regexp => process.argv.some(v => regexp.test(v)));
const ENDL = '\n\r';

const OUT_FILE = 'public/bundle.js';

function createBuildOptions<T extends esbuild.BuildOptions>(options: T) {
  return options;
}

const options = createBuildOptions({
  tsconfig: 'src/tsconfig.json',
  entryPoints: [
    'src/index.tsx'
  ],
  bundle: true,
  outfile: OUT_FILE,
  metafile: true,
  minify: !DEV_MODE,
  sourcemap: DEV_MODE,
});

function bundle() {
  const result = esbuild.buildSync(options);

  return result;
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
function showBundleResult(result: esbuild.BuildResult) {
  const outputData = result.metafile?.outputs?.[OUT_FILE];
  const inputs = result.metafile?.inputs;

  if (!inputs) return console.log('can\'t show result because result.metafile.inputs is undefined');
  if (outputData) {
    const bundleSize = formater.format(outputData.bytes);

    process.stdout.cursorTo(0, 0);
    process.stdout.clearScreenDown();

    console.log(
      `[${chalk.whiteBright('bundle info')}]:` + ENDL +
      `  bundled with ${chalk.greenBright('success')} packages` + ENDL +
      Object.entries(inputs)
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

  function watchHandler(eventName: string, fileName: string) {
    const result = bundle();

    showBundleResult(result);
  }

  const handler = debounce(watchHandler, 500);

  watcher.on('change', handler);
} else {
  const result = bundle();

  showBundleResult(result);
}



