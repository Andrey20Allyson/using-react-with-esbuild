import { expect, describe } from 'vitest';
import { CacheRegistry, CacheLike, InMemoryCache } from '../cache';

const data = Buffer.from('john due');
const url = 'a url'

describe('In memory cache', test => {

  test('Shold store data', async ctx => {
    const cache = new InMemoryCache();

    cache.save(url, data);

    const cached = await cache.require(url);

    if (!cached || data !== cached.data) {
      expect.fail(`chached value hasn't stored!`);
    }
  });

  test('Shold delete data', async ctx => {
    const cache = new InMemoryCache();

    cache.save(url, data);

    cache.delete(url);

    const cached = await cache.require(url);

    if (cached && data === cached.data) {
      expect.fail(`chached value hasn't deleted!`);
    }
  });
});

describe('Registry', test => {

  test('Shold store the current time', ctx => {
    const maxAcceptableAbsoluteDifference = 1;

    const registry = new CacheRegistry(data);
    const currentTime = Date.now();

    const absoluteDifference = Math.abs(registry.creationTime - currentTime);

    if (absoluteDifference > maxAcceptableAbsoluteDifference) {
      expect.fail(`registry.creationTime don't is current time`);
    }
  });

  test('Shold store data', ctx => {
    const registry = new CacheRegistry(data);

    if (registry.data !== data) {
      expect.fail(`registry.data and input data don't is equals`)
    }
  })
});