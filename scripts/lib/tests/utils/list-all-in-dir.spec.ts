import { test, expect } from 'vitest';
import { listAllFiles } from '../../utils/list-all-in-dir';
import zod from 'zod';

test('shold return a list of dirs', async ctx => {
  const data = await listAllFiles('src');
  
  const schema = zod.string().array();

  const { success } = schema.safeParse(data);

  if (!success) expect.fail(`data: ${data} don't is a string array`);
});