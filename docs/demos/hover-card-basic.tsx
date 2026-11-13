'use client';

import { CrAvatar, CrBox, CrHoverCard } from '@cristal/react';

export default function HoverCardBasic() {
  return (
    <div>
      Dernière modification par{' '}
      <CrHoverCard>
        <a href="#mia">Mia Laurent</a>
        <CrBox slot="card" display="flex" gap="lg" align="start">
          <CrAvatar name="Mia Laurent" status="online" />
          <div>
            <strong>Mia Laurent</strong>
            <div style={{ color: 'var(--cr-color-text-muted)' }}>Designer produit · Lyon</div>
            <p style={{ margin: 'var(--cr-spacing-sm) 0 0' }}>Responsable du design system, 48 contributions ce mois-ci.</p>
          </div>
        </CrBox>
      </CrHoverCard>
      , il y a 3 heures.
    </div>
  );
}
