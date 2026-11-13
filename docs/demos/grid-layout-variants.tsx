'use client';

import { useState } from 'react';
import { CrGridItem, CrGridLayout, CrSegmented } from '@cristal/react';

const variants = ['card', 'elevated', 'soft', 'outline', 'glass'] as const;
const handles = ['corner', 'knob', 'edges'] as const;
// La variante glass a besoin d'un fond coloré pour se voir.
const backdrop = 'radial-gradient(circle at 15% 20%, #c4b5fd, transparent 45%), radial-gradient(circle at 85% 70%, #f9a8d4, transparent 45%), #e0f2fe';

export default function GridLayoutVariants() {
  const [variant, setVariant] = useState<(typeof variants)[number]>('elevated');
  const [handle, setHandle] = useState<(typeof handles)[number]>('corner');
  const item = { variant, resizeHandle: handle };

  return (
    <div style={{ width: '100%', display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <CrSegmented label="Apparence" value={variant} onCrChange={(event) => setVariant(event.detail as typeof variant)}>
          {variants.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </CrSegmented>
        <CrSegmented label="Agrandir" value={handle} onCrChange={(event) => setHandle(event.detail as typeof handle)}>
          {handles.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </CrSegmented>
      </div>
      <div style={{ padding: 16, borderRadius: 16, background: variant === 'glass' ? backdrop : undefined }}>
        <CrGridLayout label="Indicateurs" columns={6} rowHeight={70}>
          <CrGridItem {...item} id="v-ventes" label="Ventes" x={0} y={0} w={2} h={2}>
            <strong style={{ fontSize: 26 }}>48 920 €</strong>
          </CrGridItem>
          <CrGridItem {...item} id="v-clients" label="Nouveaux clients" x={2} y={0} w={2} h={2}>
            <strong style={{ fontSize: 26 }}>312</strong>
          </CrGridItem>
          <CrGridItem {...item} id="v-panier" label="Panier moyen" x={4} y={0} w={2} h={2}>
            <strong style={{ fontSize: 26 }}>64 €</strong>
          </CrGridItem>
          <CrGridItem {...item} id="v-notes" label="Notes" x={0} y={2} w={4} h={2} minW={2}>
            Tirez le coin ou les bords pour agrandir la carte.
          </CrGridItem>
        </CrGridLayout>
      </div>
    </div>
  );
}
