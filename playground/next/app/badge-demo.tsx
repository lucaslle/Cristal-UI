'use client';

import { useState } from 'react';
import { CrBadge, CrButton } from '@cristal/react';

export function BadgeDemo() {
  const [unread, setUnread] = useState(3);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--cr-spacing-sm)', alignItems: 'center' }}>
      <CrBadge>Brouillon</CrBadge>
      <CrBadge variant="primary">Nouveau</CrBadge>
      <CrBadge variant="success">Payée</CrBadge>
      <CrBadge variant="danger">En retard</CrBadge>
      <CrBadge data-testid="badge-unread" variant="primary" count={unread} live>
        Non lus
      </CrBadge>
      <CrBadge data-testid="badge-drafts" count={12}>
        Brouillons
      </CrBadge>
      <CrButton size="s" variant="secondary" onClick={() => setUnread((count) => count + 5)}>
        Recevoir 5 messages
      </CrButton>
    </div>
  );
}
