import { expect, test } from 'vitest';
import { GridItem, compact, firstFree, moveItem, placeAll, resizeItem, rowsOf } from '../src/utils/grid-layout';

const item = (id: string, x: number, y: number, w = 2, h = 2): GridItem => ({ id, x, y, w, h, minW: 1, minH: 1, maxW: 12, maxH: 12 });
const at = (items: GridItem[], id: string) => {
  const { x, y, w, h } = items.find((i) => i.id === id)!;
  return { x, y, w, h };
};

test('compact moves items up until they touch', () => {
  const items = compact([item('a', 0, 0), item('b', 0, 5)]);
  expect(at(items, 'b')).toEqual({ x: 0, y: 2, w: 2, h: 2 });
  expect(rowsOf(items)).toBe(4);
});

test('moving onto a neighbour swaps them', () => {
  const items = moveItem([item('a', 0, 0), item('b', 2, 0)], 'a', 2, 0, 4);
  expect(at(items, 'a').x).toBe(2);
  expect(at(items, 'b').x).toBe(0);
});

test('a move stays inside the columns', () => {
  expect(at(moveItem([item('a', 0, 0)], 'a', 10, -3, 4), 'a')).toEqual({ x: 2, y: 0, w: 2, h: 2 });
});

test('resizing respects the columns, pushes the item below down and fills gaps', () => {
  const items = resizeItem([item('a', 2, 0), item('b', 0, 2)], 'a', 9, 3, 4);
  expect(at(items, 'a')).toEqual({ x: 2, y: 0, w: 2, h: 3 });
  expect(at(items, 'b').y).toBe(0);
  const wide = resizeItem([item('a', 0, 0), item('b', 0, 2)], 'a', 4, 3, 4);
  expect(at(wide, 'b').y).toBe(3);
});

test('items without a position take the first free place', () => {
  expect(at([firstFree([item('a', 0, 0)], item('b', -1, -1), 4)], 'b')).toEqual({ x: 2, y: 0, w: 2, h: 2 });
  const placed = placeAll([item('a', 0, 0, 4, 1), item('b', -1, -1), item('c', -1, -1)], 4);
  expect([at(placed, 'b'), at(placed, 'c')]).toEqual([
    { x: 0, y: 1, w: 2, h: 2 },
    { x: 2, y: 1, w: 2, h: 2 },
  ]);
});
