import { h } from '@stencil/core';

const svg = { viewBox: '0 0 48 48', width: '48', height: '48', fill: 'none', stroke: 'currentColor', 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' } as const;

/** Loupe avec un « ? » : « aucun résultat » (cr-search, cr-empty-state, cr-command-palette). */
export const Magnifier = ({ class: className }: { class?: string }) => (
  <svg class={className} {...svg}>
    <g class="shake">
      <circle cx="20" cy="20" r="13" />
      <line x1="30" y1="30" x2="42" y2="42" />
      <text class="question" x="20" y="26" text-anchor="middle" stroke="none" fill="currentColor">
        ?
      </text>
    </g>
  </svg>
);

/** Petites illustrations d'état vide, décoratives. */
export const illustrations = {
  search: Magnifier,
  inbox: ({ class: className }: { class?: string }) => (
    <svg class={className} {...svg}>
      <path d="M6 27l6-17h24l6 17v11H6z" />
      <path d="M6 27h10l3 5h10l3-5h10" />
    </svg>
  ),
  error: ({ class: className }: { class?: string }) => (
    <svg class={className} {...svg}>
      <circle cx="24" cy="24" r="18" />
      <path d="M24 14v12M24 33v.01" />
    </svg>
  ),
};
