'use client';

import { useRef } from 'react';
import { CrButton, CrGridLayout, CrGridItem } from '@cristal/react';

export default function GridLayoutBasic() {
  const grid = useRef<HTMLCrGridLayoutElement>(null);

  return (
    <div style={{ width: '100%' }}>
      <CrButton size="s" variant="secondary" onClick={() => grid.current?.reset()}>
        Reset
      </CrButton>
      <CrGridLayout ref={grid} label="Sales dashboard" columns={6} rowHeight={70} storageKey="docs-grid-en" style={{ marginTop: 16 }}>
        <CrGridItem id="ventes" label="Sales" x={0} y={0} w={2} h={2}>
          <strong style={{ fontSize: 26 }}>$48,920</strong>
        </CrGridItem>
        <CrGridItem id="clients" label="New customers" x={2} y={0} w={2} h={2}>
          <strong style={{ fontSize: 26 }}>312</strong>
        </CrGridItem>
        <CrGridItem id="panier" label="Average order" x={4} y={0} w={2} h={2}>
          <strong style={{ fontSize: 26 }}>$64</strong>
        </CrGridItem>
        <CrGridItem id="notes" label="Notes" x={0} y={2} w={4} h={2} minW={2}>
          Drag a card, pull its corner to resize it.
        </CrGridItem>
      </CrGridLayout>
    </div>
  );
}
