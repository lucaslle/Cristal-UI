export interface GridItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW: number;
  minH: number;
  maxW: number;
  maxH: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const overlap = (a: GridItem, b: GridItem) => a.id !== b.id && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const collisions = (items: GridItem[], item: GridItem) => items.filter((other) => overlap(other, item));

const sorted = (items: GridItem[]) => [...items].sort((a, b) => a.y - b.y || a.x - b.x);

const replace = (items: GridItem[], item: GridItem) => items.map((other) => (other.id === item.id ? item : other));

/** Chaque élément remonte tant que la place au-dessus est libre : pas de trou dans le grille. */
export const compact = (items: GridItem[]) => {
  const placed: GridItem[] = [];
  for (const item of sorted(items)) {
    const next = { ...item };
    while (next.y > 0 && !placed.some((other) => overlap({ ...next, y: next.y - 1 }, other))) next.y--;
    placed.push(next);
  }
  return items.map((item) => placed.find((p) => p.id === item.id)!);
};

type Direction = 'down' | 'left' | 'right' | 'none';

/** Écarte les éléments que `item` recouvre : ils prennent la place libérée du côté d'où il vient (échange), sinon passent dessous, en cascade. */
const resolve = (items: GridItem[], item: GridItem, direction: Direction, columns: number): GridItem[] => {
  let layout = items;
  for (const other of sorted(collisions(layout, item))) {
    const current = layout.find((i) => i.id === other.id)!;
    if (!overlap(current, item)) continue;
    const swaps = {
      down: { ...current, y: item.y - current.h },
      right: { ...current, x: item.x - current.w },
      left: { ...current, x: item.x + item.w },
      none: undefined,
    };
    const swap = swaps[direction];
    if (swap && swap.x >= 0 && swap.y >= 0 && swap.x + swap.w <= columns && !collisions(layout, swap).length) {
      layout = replace(layout, swap);
      continue;
    }
    const below = { ...current, y: item.y + item.h };
    layout = resolve(replace(layout, below), below, 'none', columns);
  }
  return layout;
};

export const moveItem = (items: GridItem[], id: string, x: number, y: number, columns: number) => {
  const item = items.find((i) => i.id === id);
  if (!item) return items;
  const moved = { ...item, x: clamp(x, 0, columns - item.w), y: Math.max(0, y) };
  const direction: Direction = moved.y > item.y ? 'down' : moved.x > item.x ? 'right' : moved.x < item.x ? 'left' : 'none';
  return compact(resolve(replace(items, moved), moved, direction, columns));
};

export const resizeItem = (items: GridItem[], id: string, w: number, h: number, columns: number) => {
  const item = items.find((i) => i.id === id);
  if (!item) return items;
  const resized = { ...item, w: clamp(w, item.minW, Math.min(item.maxW, columns - item.x)), h: clamp(h, item.minH, item.maxH) };
  return compact(resolve(replace(items, resized), resized, 'none', columns));
};

/** Première place libre, ligne par ligne, pour un élément sans position. */
export const firstFree = (items: GridItem[], item: GridItem, columns: number) => {
  const w = Math.min(item.w, columns);
  for (let y = 0; ; y++) {
    for (let x = 0; x + w <= columns; x++) {
      const candidate = { ...item, x, y, w };
      if (!collisions(items, candidate).length) return candidate;
    }
  }
};

export const rowsOf = (items: GridItem[]) => Math.max(0, ...items.map((item) => item.y + item.h));

export const sameLayout = (a: GridItem[], b: GridItem[]) =>
  a.length === b.length && a.every((item) => b.some((o) => o.id === item.id && o.x === item.x && o.y === item.y && o.w === item.w && o.h === item.h));

/** Place les éléments sans position (x ou y négatif) à la première place libre, puis tasse. */
export const placeAll = (items: GridItem[], columns: number) =>
  compact(items.reduce<GridItem[]>((all, item) => [...all, item.x < 0 || item.y < 0 ? firstFree(all, item, columns) : item], []));
