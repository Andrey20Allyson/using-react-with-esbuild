import { CacheRegistry } from "./registry";

export interface CacheLike {
  require(url: string): Promise<CacheRegistry | undefined>;
  save(url: string, data: Buffer): Promise<void>;
  delete(url: string): Promise<void>
}