import { expect, test } from 'vitest';
import { clamp, keyTarget, parse, precision, stepBy, top } from '../src/utils/quantity';

const halves = { min: 0, step: 0.5 };
const threes = { min: 0, max: 10, step: 3 };

test('steps land on the step grid, like the native stepUp()', () => {
  expect(stepBy(1, 1, halves)).toBe(1.5);
  expect(stepBy(1.2, 1, halves)).toBe(1.5);
  expect(stepBy(1.2, -1, halves)).toBe(1);
  expect(stepBy(0.1 + 0.2, 1, { min: 0, step: 0.1 })).toBe(0.4);
});

test('the highest value is max brought back onto the grid', () => {
  expect(top(threes)).toBe(9);
  expect(stepBy(9, 1, threes)).toBe(9);
  expect(stepBy(0, -1, threes)).toBe(0);
  expect(clamp(42, threes)).toBe(10);
});

test('spinbutton keys', () => {
  expect(keyTarget('ArrowUp', 3, threes)).toBe(6);
  expect(keyTarget('PageUp', 0, threes)).toBe(9);
  expect(keyTarget('Home', 6, threes)).toBe(0);
  expect(keyTarget('End', 0, threes)).toBe(9);
  expect(keyTarget('a', 0, threes)).toBeUndefined();
});

test('typed numbers accept a comma, decimals follow the step and min', () => {
  expect(parse(' 1,5 ')).toBe(1.5);
  expect(parse('−2')).toBe(-2);
  expect(parse('')).toBeUndefined();
  expect(parse('abc')).toBeNaN();
  expect(precision({ min: 0.5, step: 0.25 })).toBe(2);
});
