'use client';

import { useState } from 'react';
import { CrBackground, CrBox, CrButton, CrSegmented } from '@cristal/react';

const variants = [
  ['aurora', 'Aurora'],
  ['gradient', 'Gradient'],
  ['grid', 'Grid'],
  ['dots', 'Dots'],
  ['waves', 'Waves'],
  ['particles', 'Particles'],
] as const;

export default function BackgroundGallery() {
  const [index, setIndex] = useState(0);

  return (
    <CrBox display="flex" direction="column" gap="lg" align="stretch">
      <CrSegmented label="Effect" value={String(index)} onCrChange={(event) => setIndex(Number(event.detail))}>
        {variants.map(([variant, label], value) => (
          <option key={variant} value={value}>
            {label}
          </option>
        ))}
      </CrSegmented>
      <CrBackground variant={variants[index][0]} style={{ padding: '64px 32px', borderRadius: 'var(--cr-radius-l)', textAlign: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 30, lineHeight: 1.2 }}>Invoices, without the effort</h3>
        <p style={{ margin: '12px auto 24px', maxWidth: 420 }}>Create, send and track your invoices in a few clicks, from a single screen.</p>
        <CrButton>Start for free</CrButton>
      </CrBackground>
    </CrBox>
  );
}
