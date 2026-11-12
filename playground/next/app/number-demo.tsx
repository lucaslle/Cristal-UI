'use client';

import { useState } from 'react';
import { CrButton } from '@cristal/react';
import { CrNumber } from '@cristal/react/ssr';

const animations = ['roll', 'flap', 'blur', 'stagger', 'decode', 'count'] as const;
// La deuxième valeur gagne un chiffre, la troisième en perd : les rangs apparaissent et disparaissent.
const VALUES = [6482, 10315, 999, 7105];

const card = { padding: 'var(--cr-spacing-lg)', border: '1px solid var(--cr-color-border)', borderRadius: 'var(--cr-radius-l)' };

export function NumberDemo() {
  const [index, setIndex] = useState(0);
  const value = VALUES[index % VALUES.length];

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--cr-spacing-lg)' }}>
        {animations.map((animation) => (
          <div key={animation} style={card}>
            <div style={{ color: 'var(--cr-color-text-muted)' }}>{animation}</div>
            <CrNumber data-testid={`number-${animation}`} lang="fr" animation={animation} value={value} style={{ fontSize: 40, fontWeight: 800 }} /> pas
          </div>
        ))}
        <div style={card}>
          <div style={{ color: 'var(--cr-color-text-muted)' }}>Décimales</div>
          <CrNumber data-testid="number-decimals" lang="fr" value={value * 1.5 + 0.25} decimals={2} style={{ fontSize: 32, fontWeight: 800 }} /> €
        </div>
        <div style={card} lang="en">
          <div style={{ color: 'var(--cr-color-text-muted)' }}>In English</div>
          <CrNumber data-testid="number-english" value={value * 1.5 + 0.25} decimals={2} style={{ fontSize: 32, fontWeight: 800 }} /> £
        </div>
      </div>
      <CrButton size="s" variant="secondary" onClick={() => setIndex((current) => current + 1)} style={{ justifySelf: 'start' }}>
        Changer les nombres
      </CrButton>
    </div>
  );
}
