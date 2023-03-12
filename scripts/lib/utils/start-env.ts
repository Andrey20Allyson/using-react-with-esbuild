import fs from 'fs';
import path from 'path';

export type EnvLike = NodeJS.Dict<string>;

export const LINE_SPLITTER = /\r\n|\n/;
export const ENTRY_SPLITTER = '=';
export const DEFAULT_ENV_PATH = path.join(process.cwd(), '.env');

export function lineToEntry(line: string): [string, string] {
  const entries = line.split(ENTRY_SPLITTER);

  if (entries.length !== 2) throw Error(`line "${line}" can't be parsed to entry!`);

  return entries as [string, string];
}

export function envReducer(prefious: EnvLike, entry: [string, string]) {
  const [key, value] = entry;

  prefious[key] = value;

  return prefious;
}

export function envFromString(data: string): EnvLike {
  const env = data
    .split(LINE_SPLITTER)
    .map(lineToEntry)
    .reduce(envReducer, {});

  return env;
}

export function writeEnvIn(o: EnvLike, env: EnvLike) {
  for (const key in env) {
    o[key] = env[key];
  }
}

export class EnvStartError extends Error {
  constructor(path: string) {
    super(`Can't access "${path}"`);
  }
}

export function readEnvSync(path: string) {
  try {
    fs.accessSync(path, fs.constants.R_OK);

    const data = fs.readFileSync(path, { encoding: 'utf-8' });

    return data;
  } catch {
    throw new EnvStartError(path);
  }
}

export async function readEnv(path: string) {
  try {
    await fs.promises.access(path, fs.constants.R_OK);

    const data = await fs.promises.readFile(path, { encoding: 'utf-8' });

    return data;
  } catch {
    throw new EnvStartError(path);
  }
}

export function startSync() {
  const data = readEnvSync(DEFAULT_ENV_PATH);

  const env = envFromString(data);

  writeEnvIn(process.env, env);
}

export async function start() {
  const data = await readEnv(DEFAULT_ENV_PATH);

  const env = envFromString(data);

  writeEnvIn(process.env, env);
}

export function startAndNotify(listener: (err?: Error) => void) {
  start()
    .then(listener as () => void)
    .catch(listener);
}

startSync();

console.log(process.env);