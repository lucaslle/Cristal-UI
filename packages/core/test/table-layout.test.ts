import { expect, test } from 'vitest';
import { mergeState, moveTo, neighbour, pinOffsets, setHidden } from '../src/utils/table-layout';

const columns = [
  { key: 'a', label: 'A', width: 100 },
  { key: 'b', label: 'B', width: 10, pinned: true },
  { key: 'c', label: 'C' },
  { key: 'd', label: 'D', width: 120, hidden: true },
];

test('pinned columns come first, widths get a default and bounds', () => {
  const state = mergeState(columns);
  expect(state.map((c) => c.key)).toEqual(['b', 'a', 'c', 'd']);
  expect(state.map((c) => c.width)).toEqual([64, 100, 160, 120]);
});

test('saved settings win for known columns, new columns are added', () => {
  const saved = [{ key: 'c', width: 300, pinned: false, hidden: false }, { key: 'gone', width: 90, pinned: false, hidden: false }];
  expect(mergeState(columns, saved).map((c) => [c.key, c.width])).toEqual([
    ['b', 64],
    ['c', 300],
    ['a', 100],
    ['d', 120],
  ]);
});

test('a column cannot cross the pinned boundary', () => {
  const state = mergeState(columns);
  expect(moveTo(state, 'a', 'b')).toBe(state);
  expect(moveTo(state, 'c', 'a').map((c) => c.key)).toEqual(['b', 'c', 'a', 'd']);
});

test('at least one column stays visible, neighbours skip hidden ones', () => {
  let state = mergeState(columns);
  state = setHidden(setHidden(state, 'a', true), 'b', true);
  expect(setHidden(state, 'c', true)).toBe(state);
  expect(neighbour(mergeState(columns), 'c', 1)).toBeUndefined();
});

test('pinned offsets add up the widths of the pinned columns before', () => {
  const state = mergeState([...columns, { key: 'e', label: 'E', width: 80, pinned: true }]);
  expect([...pinOffsets(state)]).toEqual([
    ['b', 0],
    ['e', 64],
  ]);
});
