import { h } from '@stencil/core';
import { GridItem, rowsOf } from './grid-layout';

/** Pendant un déplacement : les cases de la grille, et l'emplacement visé en pointillés. */
export const GridOverlay = ({ ghost, layout, columns }: { ghost?: GridItem; layout: GridItem[]; columns: number }) => {
  if (!ghost) return null;
  const cells = Array.from({ length: columns * (rowsOf(layout) + 2) }, (_, i) => (
    <span class="cell" aria-hidden="true" style={{ gridColumn: `${(i % columns) + 1}`, gridRow: `${Math.floor(i / columns) + 1}` }} />
  ));
  return [...cells, <span class="ghost" aria-hidden="true" style={{ gridColumn: `${ghost.x + 1} / span ${ghost.w}`, gridRow: `${ghost.y + 1} / span ${ghost.h}` }} />];
};
