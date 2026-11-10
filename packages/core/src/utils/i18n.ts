import { en, type Messages } from './messages-en';
import { fr } from './messages-fr';

export type Lang = 'en' | 'fr';

/**
 * Langue d'un composant : son attribut lang, ou celui du plus proche parent (en sortant des shadow roots),
 * typiquement <html lang="fr">. Anglais par défaut.
 * shortcut: lue au rendu, un changement de lang en cours de route n'est pris qu'au rendu suivant.
 */
export const langOf = (el: Element): Lang => {
  let node: Element | null | undefined = el;
  while (node) {
    const found = node.closest?.('[lang]');
    if (found) return found.getAttribute('lang')!.toLowerCase().startsWith('fr') ? 'fr' : 'en';
    node = (node.getRootNode?.() as ShadowRoot | undefined)?.host;
  }
  return 'en';
};

/** Textes intégrés dans la langue du composant. */
export const t = (el: Element): Messages => (langOf(el) === 'fr' ? fr : en);

export type { Messages };
