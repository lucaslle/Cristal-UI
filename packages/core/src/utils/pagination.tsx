import { h } from '@stencil/core';

export type PageItem = number | 'gap';

/** Première et dernière pages, la page courante et ses voisines ; un « … » remplace deux pages ou plus. */
export const pageRange = (page: number, total: number): PageItem[] => {
  const kept = [...new Set([1, page - 1, page, page + 1, total])].filter((item) => item >= 1 && item <= total).sort((a, b) => a - b);
  const items: PageItem[] = [];
  kept.forEach((item, index) => {
    const gap = index ? item - kept[index - 1] : 1;
    if (gap === 2) items.push(item - 1);
    if (gap > 2) items.push('gap');
    items.push(item);
  });
  return items;
};

export const pageHref = (template: string, page: number) => template.split('{page}').join(String(page));

export const Chevron = ({ previous }: { previous?: boolean }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d={previous ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
  </svg>
);
