import esbuild from 'esbuild';
import watchDir from './utils/watch-dir.js';

const OUT_FILE = 'public/bundle.js'

/**@type {esbuild.BuildOptions} */
export const DEFAULT_OPTIONS: esbuild.BuildOptions = {
  tsconfig: 'src/tsconfig.ts',
  entryPoints: [
    'src/index.tsx'
  ],
  bundle: true,
  outfile: OUT_FILE,
  metafile: true,
};

export function bundle(options = {}) {
  return esbuild.build({...DEFAULT_OPTIONS, ...options});
}

type BundleListener<T extends esbuild.BuildOptions> = (result: esbuild.BuildResult<T>) => void;

export async function watchAndBundle<T extends esbuild.BuildOptions>(options: T, bundleListener: BundleListener<T>) {
  const result = await bundle(options);

  bundleListener(result);

  const controler = watchDir('src', async fileName => {
    const result = await bundle(options);

    bundleListener(result);
  });

  return controler; 
}