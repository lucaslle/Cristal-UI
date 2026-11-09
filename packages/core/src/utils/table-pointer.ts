import { EASE } from './accordion';
import { reducedMotion } from './popup';

const cellsOf = (table: HTMLElement, key: string) => Array.from(table.querySelectorAll<HTMLElement>(`[data-key="${CSS.escape(key)}"]`));
const headerOf = (table: HTMLElement, key: string) => table.querySelector<HTMLElement>(`th[data-key="${CSS.escape(key)}"]`);

const follow = (target: HTMLElement, event: PointerEvent, onMove: (e: PointerEvent) => void, onEnd: () => void) => {
  target.setPointerCapture(event.pointerId);
  const end = () => {
    target.removeEventListener('pointermove', onMove);
    target.removeEventListener('pointerup', end);
    target.removeEventListener('pointercancel', end);
    onEnd();
  };
  target.addEventListener('pointermove', onMove);
  target.addEventListener('pointerup', end);
  target.addEventListener('pointercancel', end);
};

/** Poignée de redimensionnement : onWidth reçoit la nouvelle largeur à chaque mouvement. */
export const dragResize = (event: PointerEvent, startWidth: number, onWidth: (width: number) => void, onEnd: () => void) => {
  event.preventDefault();
  event.stopPropagation();
  follow(event.currentTarget as HTMLElement, event, (e) => onWidth(startWidth + e.clientX - event.clientX), onEnd);
};

interface ColumnDrag {
  event: PointerEvent;
  key: string;
  table: HTMLElement;
  indicator: HTMLElement;
  candidates: string[];
  onDrop: (target: string) => void;
}

/** Glisser un en-tête : la colonne vole avec le pointeur, un trait montre où elle sera posée. */
export const dragColumn = ({ event, key, table, indicator, candidates, onDrop }: ColumnDrag) => {
  if (event.button !== 0) return;
  const own = headerOf(table, key);
  if (!own) return;
  const start = event.clientX;
  const origin = table.getBoundingClientRect().left;
  let flying = false;
  let target = key;
  follow(
    event.currentTarget as HTMLElement,
    event,
    (e) => {
      const dx = e.clientX - start;
      if (!flying && Math.abs(dx) < 6) return;
      flying = true;
      cellsOf(table, key).forEach((cell) => {
        cell.classList.add('flying');
        cell.style.transform = `translateX(${dx}px)`;
      });
      const x = e.clientX - origin;
      target = candidates.find((k) => {
        const th = headerOf(table, k);
        return !!th && x >= th.offsetLeft && x < th.offsetLeft + th.offsetWidth;
      }) ?? target;
      const th = headerOf(table, target)!;
      indicator.hidden = target === key;
      indicator.style.left = `${th.offsetLeft + (th.offsetLeft > own.offsetLeft ? th.offsetWidth : 0)}px`;
    },
    () => {
      cellsOf(table, key).forEach((cell) => {
        cell.classList.remove('flying');
        cell.style.transform = '';
      });
      indicator.hidden = true;
      if (flying && target !== key) onDrop(target);
    },
  );
};

export const columnLefts = (table?: HTMLElement) =>
  new Map(Array.from(table?.querySelectorAll<HTMLElement>('th[data-key]') ?? []).map((th) => [th.dataset.key!, th.offsetLeft]));

/** Après un réordonnancement, chaque colonne glisse de son ancienne place à la nouvelle. */
export const flipColumns = (table: HTMLElement, before: Map<string, number>) => {
  if (reducedMotion()) return;
  columnLefts(table).forEach((left, key) => {
    const dx = (before.get(key) ?? left) - left;
    if (dx) cellsOf(table, key).forEach((cell) => cell.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }], { duration: 320, easing: EASE }));
  });
};

/** Largeur qui affiche entièrement le plus long contenu de la colonne. */
export const fitWidth = (table: HTMLElement, key: string) =>
  Math.max(...cellsOf(table, key).map((cell) => (cell.querySelector<HTMLElement>('.text')?.offsetWidth ?? 0) + 40));
