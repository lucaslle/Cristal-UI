export type HeaderAction =
  | { type: 'focus'; to: 1 | -1 | 'first' | 'last' }
  | { type: 'move'; step: 1 | -1 }
  | { type: 'resize'; delta: number }
  | { type: 'pin' }
  | { type: 'hide' }
  | { type: 'fit' };

/** Raccourcis sur un en-tête de colonne. */
export const headerAction = (event: KeyboardEvent): HeaderAction | undefined => {
  const arrow = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
  if (arrow && event.altKey) return { type: 'move', step: arrow };
  if (arrow && event.shiftKey) return { type: 'resize', delta: arrow * 16 };
  if (arrow) return { type: 'focus', to: arrow };
  if (event.key === 'Home' || event.key === 'End') return { type: 'focus', to: event.key === 'Home' ? 'first' : 'last' };
  if (event.ctrlKey || event.metaKey || event.altKey) return undefined;
  if (event.key.toLowerCase() === 'f') return { type: 'pin' };
  if (event.key.toLowerCase() === 'm') return { type: 'hide' };
  if (event.key === 'Enter') return { type: 'fit' };
  return undefined;
};
