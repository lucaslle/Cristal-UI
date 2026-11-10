'use client';

import { useState } from 'react';
import { CrButton, CrIconButton } from '@cristal/react';
import { Bell, Loader, Mail } from 'lucide-react';

export default function IconButtonBadge() {
  const [unread, setUnread] = useState(3);
  return (
    <>
      <CrIconButton label="Notifications" variant="secondary" badge={unread || undefined} onClick={() => setUnread(0)}>
        <Bell aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="Messages" variant="secondary" badge="99+">
        <Mail aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="Synchronisation" loading>
        <Loader aria-hidden="true" />
      </CrIconButton>
      <CrButton size="s" variant="outline" onClick={() => setUnread((count) => count + 1)}>
        Nouvelle notification
      </CrButton>
    </>
  );
}
