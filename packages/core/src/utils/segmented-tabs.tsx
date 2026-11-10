import { h } from '@stencil/core';

/** Rôle et état d'un segment : onglet en mode onglets, bouton radio sinon. */
export const segmentRole = (tabs: boolean, index: number, checked: boolean) =>
  tabs
    ? { role: 'tab', id: `tab-${index}`, 'aria-selected': checked ? 'true' : 'false', 'aria-controls': 'panel' }
    : { role: 'radio', 'aria-checked': checked ? 'true' : 'false' };

/** Panneau de l'onglet choisi, nommé par son onglet. */
export const tabPanel = (current: number, direction?: 'next' | 'prev') => [
  // Masque les autres panneaux depuis le shadow DOM : le rendu serveur les cache déjà, sans toucher aux enfants.
  <style>{`::slotted(:not(:nth-of-type(${current + 1}))) { display: none; }`}</style>,
  <div key={current} class="panel" part="panel" role="tabpanel" id="panel" aria-labelledby={`tab-${current}`} tabIndex={0} data-direction={direction}>
    <slot />
  </div>,
];
