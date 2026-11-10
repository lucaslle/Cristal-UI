'use client';

import { CrButton, CrTooltip } from '@cristal/react';

export function TooltipDemo() {
  return (
    <div style={{ display: 'flex', gap: 'var(--cr-spacing-xl)', alignItems: 'center', margin: 'var(--cr-spacing-2xl) 0' }}>
      <CrTooltip text="Copie l'adresse de la page">
        <CrButton variant="outline">Copier le lien</CrButton>
      </CrTooltip>
      <CrTooltip text="À compter de la date de livraison" placement="bottom">
        <a href="#retours">Retours sous 30 jours</a>
      </CrTooltip>
    </div>
  );
}
