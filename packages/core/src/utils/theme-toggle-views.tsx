import { h } from '@stencil/core';

export type ThemeToggleIcon = 'morph' | 'rotate' | 'rise' | 'flip' | 'eclipse';

const angles = Array.from({ length: 8 }, (_, index) => index * 45);
// Le croissant de morph à l'arrivée : disque de 8,5 creusé par un disque de 7 décalé de (5, -5).
const moon = 'M20.43 13.11A8.5 8.5 0 1 1 10.89 3.57A7 7 0 0 0 20.43 13.11Z';

/** Huit rayons de inner à outer autour du centre. */
const rays = (inner: number, outer: number) => (
  <g class="rays" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    {angles.map((angle) => (
      <line x1="12" y1={12 - outer} x2="12" y2={12 - inner} transform={`rotate(${angle} 12 12)`} />
    ))}
  </g>
);

/** Étoile à quatre branches centrée en (x, y). */
const star = (x: number, y: number, size: number) => <path class="star" d={`M${x} ${y - size}Q${x} ${y} ${x + size} ${y}Q${x} ${y} ${x} ${y + size}Q${x} ${y} ${x - size} ${y}Q${x} ${y} ${x} ${y - size}Z`} />;

const svg = (kind: string, children: unknown) => (
  <svg class={`icon ${kind}`} part="icon" viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

const sun = () => (
  <g class="sun">
    <circle cx="12" cy="12" r="4.5" fill="currentColor" />
    {rays(7.5, 10)}
  </g>
);

const views: Record<ThemeToggleIcon, () => unknown> = {
  morph: () =>
    svg('morph', [
      <mask id="crescent">
        <rect width="24" height="24" fill="white" />
        <circle class="bite" cx="12" cy="12" r="7" fill="black" />
      </mask>,
      <circle class="disc" cx="12" cy="12" r="8.5" fill="currentColor" mask="url(#crescent)" />,
      rays(7.75, 10.25),
    ]),
  rotate: () => svg('rotate', [sun(), <path class="moon" d={moon} fill="currentColor" />]),
  rise: () =>
    svg('rise', [
      <clipPath id="sky">
        <rect width="24" height="18" />
      </clipPath>,
      <g clip-path="url(#sky)">
        <g class="sun">
          <circle cx="12" cy="11.5" r="4.5" fill="currentColor" />
          <g transform="translate(0 -0.5)">{rays(6.75, 8.75)}</g>
        </g>
        <path class="moon" d={moon} fill="currentColor" transform="translate(12 10.5) scale(0.8) translate(-12 -12)" />
      </g>,
      <line class="horizon" x1="2" y1="20" x2="22" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />,
    ]),
  // Deux faces en HTML : la 3D (preserve-3d, backface-visibility) n'est pas fiable sur des éléments SVG.
  flip: () => (
    <span class="icon flip" part="icon" aria-hidden="true">
      <svg class="face" viewBox="0 0 24 24">
        {sun()}
      </svg>
      <svg class="face back" viewBox="0 0 24 24">
        <path d={moon} fill="currentColor" />
      </svg>
    </span>
  ),
  eclipse: () =>
    svg('eclipse', [
      <mask id="shade">
        <rect width="24" height="24" fill="white" />
        <circle class="shadow" cx="12" cy="12" r="6.5" fill="black" />
      </mask>,
      <circle cx="12" cy="12" r="6" fill="currentColor" mask="url(#shade)" />,
      rays(8, 10.5),
      <g class="stars" fill="currentColor">
        {star(19, 4.5, 3.2)}
        {star(21.5, 13, 2)}
        {star(18, 19.5, 2.4)}
      </g>,
    ]),
};

/** L'icône soleil / lune animée de la bascule ; l'état vient de l'attribut theme de l'hôte, en CSS. */
export const themeIcon = (icon: ThemeToggleIcon) => (views[icon] ?? views.morph)();
