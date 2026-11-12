'use client';

import { useState } from 'react';
import { CrBox, CrQuantity, CrSegmented } from '@cristal/react';

const animations = [
  ['press', 'Pression'],
  ['slide', 'Glissement'],
  ['ripple', 'Onde'],
  ['stretch', 'Élastique'],
  ['spin', 'Bascule'],
  ['halo', 'Halo'],
] as const;

const PRICE = 14;

export default function QuantityProduct() {
  const [animation, setAnimation] = useState(0);
  const [quantity, setQuantity] = useState<number | undefined>(2);

  return (
    <CrBox display="flex" direction="column" gap="xl" align="center">
      <CrSegmented label="Animation" fit value={String(animation)} onCrChange={(event) => setAnimation(Number(event.detail))}>
        {animations.map(([value, label], index) => (
          <option key={value} value={index}>
            {label}
          </option>
        ))}
      </CrSegmented>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, padding: 24, borderRadius: 'var(--cr-radius-l)', background: 'var(--cr-color-surface)', boxShadow: 'var(--cr-shadow-m)' }}>
        <div aria-hidden="true" style={{ width: 64, height: 64, borderRadius: 'var(--cr-radius-l)', background: 'radial-gradient(circle at 35% 30%, var(--cr-color-primary-subtle), var(--cr-color-primary))' }} />
        <div style={{ minWidth: 120 }}>
          <h3 style={{ margin: 0 }}>Mug Orbite</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--cr-color-text-muted)' }}>{(PRICE * (quantity ?? 0)).toLocaleString('fr-FR')} €</p>
        </div>
        <CrQuantity label="Quantité" max={9} value={quantity} animation={animations[animation][0]} onCrInput={(event) => setQuantity(event.detail)} />
      </div>
    </CrBox>
  );
}
