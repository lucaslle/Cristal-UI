'use client';

import { CrAvatar, CrBox, CrHoverCard } from '@cristal/react';

export default function HoverCardBasic() {
  return (
    <div>
      Last edited by{' '}
      <CrHoverCard>
        <a href="#mia">Mia Laurent</a>
        <CrBox slot="card" display="flex" gap="lg" align="start">
          <CrAvatar name="Mia Laurent" status="online" />
          <div>
            <strong>Mia Laurent</strong>
            <div style={{ color: 'var(--cr-color-text-muted)' }}>Product designer · Lyon</div>
            <p style={{ margin: 'var(--cr-spacing-sm) 0 0' }}>Owns the design system, 48 contributions this month.</p>
          </div>
        </CrBox>
      </CrHoverCard>
      , 3 hours ago.
    </div>
  );
}
