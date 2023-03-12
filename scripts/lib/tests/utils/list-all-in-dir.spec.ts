import { test, expect, describe } from 'vitest';
import { listAllFiles } from '../../utils/list-all-in-dir';

test('shold return a list of dirs', async ctx => {
  const data = await listAllFiles('src');
  
  expect(data).toBeInstanceOf(Array);
  expect(data[0]).toBeTypeOf('string');
});