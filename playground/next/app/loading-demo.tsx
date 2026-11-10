'use client';

import { useState } from 'react';
import { CrButton, CrImage, CrLoader, CrProgress, CrProgressSteps, CrSkeleton } from '@cristal/react';

const steps = ['Recherche', 'Lecture', 'Rédaction'];
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--cr-spacing-xl)', alignItems: 'start' };
const pixel = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"%3E%3Crect width="16" height="9" fill="%236d28d9"/%3E%3C/svg%3E';

export function LoadingDemo() {
  const [value, setValue] = useState(0);
  const [current, setCurrent] = useState(0);

  return (
    <div style={grid}>
      <div aria-busy="true" style={{ display: 'grid', gap: 'var(--cr-spacing-sm)' }}>
        <CrSkeleton shape="block" height="80px" />
        <CrSkeleton width="80%" />
        <CrSkeleton shape="circle" />
      </div>
      <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)' }}>
        <CrProgress label="Import" />
        <CrProgress label="Téléversement" value={value} showValue />
        <CrButton size="s" onClick={() => setValue(100)}>Lancer le téléversement</CrButton>
      </div>
      <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', justifyItems: 'start' }}>
        <CrProgressSteps label="Réponse" steps={steps} current={current} />
        <CrButton size="s" onClick={() => setCurrent(current + 1)}>Étape suivante</CrButton>
      </div>
      <div style={{ display: 'flex', gap: 'var(--cr-spacing-xl)', alignItems: 'end' }}>
        <CrLoader />
        <CrLoader variant="bounce" label="Chargement des messages…" />
      </div>
      <CrImage src={pixel} alt="Aplat violet" style={{ aspectRatio: '16 / 9' }} />
    </div>
  );
}
