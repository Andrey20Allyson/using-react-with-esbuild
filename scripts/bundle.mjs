import { buildSync } from 'esbuild';

console.log(process.env);

/**@type {esbuild.BuildOptions} */
const options = {
  tsconfig: 'tsconfig.json',
  entryPoints: [
    'src/index.tsx'
  ],
  bundle: true,
  outfile: 'public/bundle.js',
  metafile: true,
};

const result = buildSync(options);

console.log(result.metafile);