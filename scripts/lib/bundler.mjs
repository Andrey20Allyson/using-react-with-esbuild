import esbuild from 'esbuild';
import watchDir from './utils/watch-dir.mjs';

/**@type {esbuild.BuildOptions} */
export const DEFAULT_OPTIONS = {
  tsconfig: 'tsconfig.json',
  entryPoints: [
    'src/index.tsx'
  ],
  bundle: true,
  outfile: OUT_FILE,
  metafile: true,
};

/**
 * 
 * @param {esbuild.BuildOptions} options 
 * @returns {esbuild.BuildOptions}
 */
export function bundle(options = {}) {
  return esbuild.build({...DEFAULT_OPTIONS, ...options});
}

/**
 * 
 * @param {esbuild.BuildOptions} options
 * @param {(result: esbuild.BuildResult) => void} bundleListener
 */
export function watchAndBundle(options = {}, bundleListener) {
  const result = bundle(options);

  bundleListener(result);

  const finalizer = watchDir('src', fileName => {
    bundle(options);

    bundleListener(result);
  });

  return finalizer; 
}