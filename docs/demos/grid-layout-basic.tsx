'use client';

import { useRef } from 'react';
import { CrButton, CrGridLayout, CrGridItem } from '@cristal/react';

export default function GridLayoutBasic() {
  const grid = useRef<HTMLCrGridLayoutElement>(null);

  return (
    <div style={{ width: '100%' }}>
      <CrButton size="s" variant="secondary" onClick={() => grid.current?.reset()}>
        Restaurer
      </CrButton>
      <CrGridLayout ref={grid} label="Tableau de bord des ventes" columns={6} rowHeight={70} storageKey="docs-grid" style={{ marginTop: 16 }}>
        <CrGridItem id="ventes" label="Ventes" x={0} y={0} w={2} h={2}>
          <strong style={{ fontSize: 26 }}>48 920 €</strong>
        </CrGridItem>
        <CrGridItem id="clients" label="Nouveaux clients" x={2} y={0} w={2} h={2}>
          <strong style={{ fontSize: 26 }}>312</strong>
        </CrGridItem>
        <CrGridItem id="panier" label="Panier moyen" x={4} y={0} w={2} h={2}>
          <strong style={{ fontSize: 26 }}>64 €</strong>
        </CrGridItem>
        <CrGridItem id="notes" label="Notes" x={0} y={2} w={4} h={2} minW={2}>
          Glissez une carte par sa poignée, tirez son coin pour changer sa taille.
        </CrGridItem>
      </CrGridLayout>
    </div>
  );
}
