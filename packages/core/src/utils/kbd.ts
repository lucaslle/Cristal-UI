import type { Messages } from './i18n';

export interface KeyFace {
  /** Ce qui est dessiné sur la touche. */
  shown: string;
  /** Nom lu à la place d'un symbole, absent quand le texte se lit tel quel. */
  spoken?: string;
}

/** Touches d'un raccourci « Mod+Shift+K », avec les symboles Mac (⌘ ⌥ ⇧ ⌃) ou les noms courts ailleurs. */
export const keyFaces = (keys: string, apple: boolean, m: Messages): KeyFace[] =>
  keys
    .split('+')
    .map((key) => key.trim())
    .filter(Boolean)
    .map((key) => {
      const name = key.toLowerCase();
      if (name === 'mod') return apple ? { shown: '⌘', spoken: m.keyCommand } : { shown: 'Ctrl' };
      if (name === 'ctrl' || name === 'control') return apple ? { shown: '⌃', spoken: m.keyControl } : { shown: 'Ctrl' };
      if (name === 'alt' || name === 'option') return apple ? { shown: '⌥', spoken: m.keyOption } : { shown: 'Alt' };
      if (name === 'shift') return apple ? { shown: '⇧', spoken: m.keyShift } : { shown: m.keyShift };
      return { shown: key.length === 1 ? key.toUpperCase() : key };
    });
