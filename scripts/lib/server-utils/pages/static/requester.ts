import fs from 'fs/promises';
import path from 'path';
import type { PageDataRequester, PageCacheValidifierRequester, PageRequesterLike } from '..';
import { CacheLike, InMemoryCache } from '../../cache';

export interface StaticPageRequesterConfig {
  requester: PageDataRequester;
  cacheValidifier: PageCacheValidifierRequester;
  cache: CacheLike;
  rootDir: string;
}

export const defaultStaticCacheValidifierRequester: PageCacheValidifierRequester = async function (requester, url, cached) {
  const filePath = requester.pathFromUrl(url);
  
  const stat = await fs.stat(filePath);
  
  const isValid = cached.isUpdated(stat.mtimeMs);

  return isValid;
}

export const defaultStaticRequester: PageDataRequester = async function (requester, url) {
  const filePath = requester.pathFromUrl(url);

  const data = await fs.readFile(filePath);

  return data;
}

export class StaticPageRequester implements PageRequesterLike {
  requester: PageDataRequester = defaultStaticRequester;
  isCacheValid: PageCacheValidifierRequester = defaultStaticCacheValidifierRequester;
  readonly cache: CacheLike;
  readonly ROOT_DIR: string;

  constructor(config?: StaticPageRequesterConfig) {
    this.cache = config?.cache ?? new InMemoryCache();
    this.ROOT_DIR = config?.rootDir ?? '.';
  }

  pathFromUrl(url: string) {
    return path.join(process.cwd(), this.ROOT_DIR, url.at(-1) === '/' ? url + 'index.html' : url);
  }

  async request(url: string): Promise<Buffer> {
    const cached = await this.cache.require(url);

    if (cached && await this.isCacheValid(this, url, cached)) {
      return cached.data;
    }

    const data = await this.requester(this, url);

    return data;
  }
}