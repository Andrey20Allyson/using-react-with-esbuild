import { CacheRegistry } from '../cache';

export * from './static';

export interface PageRequesterLike {
  pathFromUrl(url: string): string;
  request(url: string): Promise<Buffer>;
}

export type PageDataRequester = (requester: PageRequesterLike, url: string) => Promise<Buffer>;
export type PageCacheValidifierRequester = (requester: PageRequesterLike, url: string, cache: CacheRegistry) => Promise<boolean>;