const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

// Le panneau quitte son bord pour une position fixe, que le déplacement et le redimensionnement modifient ensuite.
const place = (panel: HTMLElement, left: number, top: number) => {
  panel.style.inset = 'auto';
  panel.style.margin = '0';
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.dataset.moved = '';
};

/** Déplace le panneau de dx, dy pixels sans qu'il sorte de l'écran. */
export const moveBy = (panel: HTMLElement, dx: number, dy: number) => {
  const box = panel.getBoundingClientRect();
  place(panel, clamp(box.left + dx, 0, window.innerWidth - box.width), clamp(box.top + dy, 0, window.innerHeight - box.height));
};

/**
 * Agrandit le panneau de dx, dy pixels depuis son coin bas, à gauche (fromLeft, le bord gauche bouge) ou à droite.
 * Il garde une taille minimale et reste dans l'écran.
 */
export const resizeBy = (panel: HTMLElement, dx: number, dy: number, fromLeft: boolean) => {
  const box = panel.getBoundingClientRect();
  const width = clamp(box.width + (fromLeft ? -dx : dx), MIN_WIDTH, fromLeft ? box.right : window.innerWidth - box.left);
  const height = clamp(box.height + dy, MIN_HEIGHT, window.innerHeight - box.top);
  place(panel, fromLeft ? box.right - width : box.left, box.top);
  panel.style.width = `${width}px`;
  panel.style.height = `${height}px`;
};

/** Rend au panneau son bord et sa taille d'origine. */
export const resetMove = (panel?: HTMLElement) => {
  if (!panel || !('moved' in panel.dataset)) return;
  for (const property of ['inset', 'margin', 'left', 'top', 'width', 'height']) panel.style.removeProperty(property);
  delete panel.dataset.moved;
};

const keySteps: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

/** Flèche appuyée, en pixels : 16 par appui, 64 avec Maj ; undefined pour une autre touche. */
export const keyDelta = (event: KeyboardEvent): [number, number] | undefined => {
  const step = keySteps[event.key];
  const distance = event.shiftKey ? 64 : 16;
  return step && [step[0] * distance, step[1] * distance];
};

/** Suit le pointeur depuis un appui sur l'élément qui écoute : onDelta reçoit le déplacement depuis le mouvement précédent. */
export const followPointer = (panel: HTMLElement, event: PointerEvent, onDelta: (dx: number, dy: number) => void) => {
  if (event.button !== 0) return;
  const target = event.currentTarget as HTMLElement;
  let last = { x: event.clientX, y: event.clientY };
  target.setPointerCapture(event.pointerId);
  panel.dataset.dragging = '';
  const onMove = (move: PointerEvent) => {
    onDelta(move.clientX - last.x, move.clientY - last.y);
    last = { x: move.clientX, y: move.clientY };
  };
  const onUp = () => {
    delete panel.dataset.dragging;
    target.removeEventListener('pointermove', onMove);
    target.removeEventListener('pointerup', onUp);
    target.removeEventListener('pointercancel', onUp);
  };
  target.addEventListener('pointermove', onMove);
  target.addEventListener('pointerup', onUp);
  target.addEventListener('pointercancel', onUp);
};

/** Glisser depuis l'en-tête déplace le panneau ; le bouton Fermer reste un simple bouton. */
export const dragFromHeader = (panel: HTMLElement, event: PointerEvent) => {
  if ((event.composedPath() as HTMLElement[]).some((el) => el.classList?.contains('close'))) return;
  followPointer(panel, event, (dx, dy) => moveBy(panel, dx, dy));
};
