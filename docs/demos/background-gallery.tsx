'use client';

import { useState } from 'react';
import { CrBackground, CrBox, CrButton, CrSegmented } from '@cristal/react';

const variants = [
  ['aurora', 'Aurore'],
  ['gradient', 'Dégradé'],
  ['grid', 'Grille'],
  ['dots', 'Points'],
  ['waves', 'Vagues'],
  ['particles', 'Particules'],
] as const;

export default function BackgroundGallery() {
  const [index, setIndex] = useState(0);

  return (
    <CrBox display="flex" direction="column" gap="lg" align="stretch">
      <CrSegmented label="Effet" value={String(index)} onCrChange={(event) => setIndex(Number(event.detail))}>
        {variants.map(([variant, label], value) => (
          <option key={variant} value={value}>
            {label}
          </option>
        ))}
      </CrSegmented>
      <CrBackground variant={variants[index][0]} style={{ padding: '64px 32px', borderRadius: 'var(--cr-radius-l)', textAlign: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 30, lineHeight: 1.2 }}>Vos factures, sans effort</h3>
        <p style={{ margin: '12px auto 24px', maxWidth: 420 }}>Créez, envoyez et suivez vos factures en quelques clics, depuis un seul écran.</p>
        <CrButton>Commencer gratuitement</CrButton>
      </CrBackground>
    </CrBox>
  );
}
