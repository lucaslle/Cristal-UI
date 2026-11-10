import { h } from '@stencil/core';
import type { Messages } from './i18n';
import { Magnifier } from './illustrations';

/** Loupe dont le cercle s'efface, le manche pivote en tige et la pointe se trace : elle devient une flèche retour. */
export const MorphIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle class="lens" cx="10" cy="10" r="6" />
    <line class="shaft" x1="5" y1="12" x2="19" y2="12" />
    <polyline class="head" points="11 6 5 12 11 18" pathLength="1" />
  </svg>
);

export const ClockIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

/** Loupe qui secoue la tête, puis un « ? » apparaît dedans. */
export const NoResults = ({ query, m }: { query: string; m: Messages }) => (
  <div class="empty" part="empty">
    <Magnifier class="empty-icon" />
    <div>
      <strong>{m.noResultsFor(query)}</strong>
      <span class="hint">{m.noResultsHint}</span>
    </div>
  </div>
);

/** Fait voler le texte d'une puce jusqu'au début du champ ; le texte du champ reste transparent pendant le vol. */
export const flyTo = (text: HTMLElement, input: HTMLInputElement) => {
  const from = text.getBoundingClientRect();
  const to = input.getBoundingClientRect();
  const ghost = document.createElement('span');
  ghost.className = 'ghost';
  ghost.textContent = text.textContent;
  ghost.setAttribute('aria-hidden', 'true');
  Object.assign(ghost.style, { left: `${from.left}px`, top: `${from.top}px` });
  (text.getRootNode() as ShadowRoot).appendChild(ghost);
  input.style.color = 'transparent';
  const land = () => {
    ghost.remove();
    input.style.color = '';
  };
  const dx = to.left + parseFloat(getComputedStyle(input).paddingLeft) - from.left;
  const dy = to.top + (to.height - from.height) / 2 - from.top;
  const scale = parseFloat(getComputedStyle(input).fontSize) / parseFloat(getComputedStyle(text).fontSize);
  ghost
    .animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${scale})` }], { duration: 380, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' })
    .finished.then(land, land);
};
