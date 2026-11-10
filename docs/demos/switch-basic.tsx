'use client';

import { useState } from 'react';
import { CrBox, CrSwitch } from '@cristal/react';

export default function SwitchBasic() {
  const [notifications, setNotifications] = useState(true);

  return (
    <CrBox display="flex" direction="column" gap="lg">
      <CrSwitch label="Notifications" name="notifications" checked={notifications} onCrChange={(event) => setNotifications(event.detail)} />
      <CrSwitch label="Mode sombre" />
      <CrSwitch label="Synchronisation (réservée aux comptes Pro)" disabled />
      <p>Notifications : {notifications ? 'activées' : 'désactivées'}</p>
    </CrBox>
  );
}
