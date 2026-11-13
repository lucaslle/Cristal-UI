import { EASE } from './accordion';
import { reducedMotion } from './popup';

/** Suit le pointeur jusqu'au relâchement : onMove reçoit le déplacement depuis le départ. */
export const track = (event: PointerEvent, target: HTMLElement, onMove: (dx: number, dy: number) => void, onEnd: (moved: boolean) => void) => {
  event.preventDefault();
  target.setPointerCapture(event.pointerId);
  let moved = false;
  const move = (e: PointerEvent) => {
    moved = moved || Math.abs(e.clientX - event.clientX) + Math.abs(e.clientY - event.clientY) > 4;
    if (moved) onMove(e.clientX - event.clientX, e.clientY - event.clientY);
  };
  const end = () => {
    target.removeEventListener('pointermove', move);
    target.removeEventListener('pointerup', end);
    target.removeEventListener('pointercancel', end);
    onEnd(moved);
  };
  target.addEventListener('pointermove', move);
  target.addEventListener('pointerup', end);
  target.addEventListener('pointercancel', end);
};

export const rectsOf = (elements: HTMLElement[]) => new Map(elements.map((el) => [el, el.getBoundingClientRect()]));

/** Chaque élément glisse de son ancienne place à la nouvelle (FLIP). */
export const slide = (before: Map<HTMLElement, DOMRect>, skip?: HTMLElement) => {
  if (reducedMotion()) return;
  before.forEach((old, el) => {
    if (el === skip) return;
    const now = el.getBoundingClientRect();
    const dx = old.left - now.left;
    const dy = old.top - now.top;
    const sx = now.width ? old.width / now.width : 1;
    const sy = now.height ? old.height / now.height : 1;
    if (!dx && !dy && sx === 1 && sy === 1) return;
    el.animate([{ transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: 'top left', transform: 'none' }], {
      duration: 320,
      easing: EASE,
    });
  });
};

/** L’élément lâché revient en douceur se poser dans sa case. */
export const settle = (el: HTMLElement) => {
  const from = el.style.translate;
  el.style.translate = '';
  if (from && !reducedMotion()) el.animate([{ translate: from }, { translate: '0 0' }], { duration: 220, easing: EASE });
};

const CONTROLS = 'a[href], button, input, select, textarea, label, summary, [contenteditable="true"], [contenteditable=""], [role="button"], [role="checkbox"], [role="slider"], [role="textbox"]';

/** Vrai si le pointeur est sur un contrôle de l’élément : maintenir le clic dessus ne doit pas soulever la carte. */
export const onControl = (path: EventTarget[], widget: HTMLElement) => {
  for (const el of path) {
    if (el === widget) return false;
    if (el instanceof Element && (el.matches(CONTROLS) || (el.tagName.startsWith('CR-') && el.tagName !== 'CR-BOX'))) return true;
  }
  return false;
};

export const HOLD_DELAY = 300;

/** Appui maintenu : onHold est appelé après HOLD_DELAY sans bouger ; un mouvement ou un relâchement avant l'annule. */
export const holdStill = (event: PointerEvent, onHold: () => void) => {
  const stop = () => {
    clearTimeout(timer);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', stop);
    window.removeEventListener('pointercancel', stop);
  };
  const move = (e: PointerEvent) => Math.hypot(e.clientX - event.clientX, e.clientY - event.clientY) > 6 && stop();
  const timer = setTimeout(() => (stop(), onHold()), HOLD_DELAY);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', stop);
  window.addEventListener('pointercancel', stop);
};

/** Vrai si le pointeur est sur la barre de défilement de l'élément visé : elle doit rester utilisable sans attraper la carte. */
export const onScrollbar = (event: PointerEvent) => {
  const el = event.composedPath()[0];
  if (!(el instanceof HTMLElement) || (el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth)) return false;
  const rect = el.getBoundingClientRect();
  return event.clientX - rect.left - el.clientLeft > el.clientWidth || event.clientY - rect.top - el.clientTop > el.clientHeight;
};
