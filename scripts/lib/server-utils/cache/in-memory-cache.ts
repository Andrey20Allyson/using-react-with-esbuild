import { CacheLike } from './base';
import { CacheRegistry } from './registry';

export class InMemoryCache implements CacheLike {
  private map: Map<string, CacheRegistry>;

  constructor() {
    this.map = new Map();
  }

  async delete(url: string) {
    this.map.delete(url);
  }
  
  async require(url: string) {
    return this.map.get(url);
  }

  async save(url: string, data: Buffer) {
    this.map.set(url, new CacheRegistry(data));
  }
}