'use client';

import { useState } from 'react';
import { CrBadge, CrBox, CrButton } from '@cristal/react';

export default function BadgeBasic() {
  const [unread, setUnread] = useState(3);

  return (
    <CrBox display="flex" direction="column" gap="lg" align="start">
      <CrBox display="flex" gap="sm" align="center" wrap>
        <CrBadge>Brouillon</CrBadge>
        <CrBadge variant="primary">Nouveau</CrBadge>
        <CrBadge variant="success">Payée</CrBadge>
        <CrBadge variant="danger">En retard</CrBadge>
      </CrBox>
      <CrBox display="flex" gap="sm" align="center" wrap>
        <CrBadge variant="primary" count={unread} live>
          Non lus
        </CrBadge>
        <CrButton size="s" variant="secondary" onClick={() => setUnread((count) => count + 4)}>
          Recevoir des messages
        </CrButton>
        <CrButton size="s" variant="outline" onClick={() => setUnread(0)}>
          Tout lire
        </CrButton>
      </CrBox>
    </CrBox>
  );
}
