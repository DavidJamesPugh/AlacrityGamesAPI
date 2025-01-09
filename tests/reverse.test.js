// eslint-disable-next-line import/no-nodejs-modules
import test from 'node:test';
// eslint-disable-next-line import/no-nodejs-modules
import assert from 'assert';
import { Tests } from '../utils/for_testing.js';

test('reverse of a', () => {
  const result = Tests.reverse('a');

  assert.strictEqual(result, 'a');
});

test('reverse of react', () => {
  const result = Tests.reverse('react');

  assert.strictEqual(result, 'tcaer');
});

test('reverse of saippuakauppias', () => {
  const result = Tests.reverse('saippuakauppias');

  assert.strictEqual(result, 'saippuakauppias');
});
