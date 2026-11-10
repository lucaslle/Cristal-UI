'use client';

import { useState } from 'react';
import { CrSwitch } from '@cristal/react';

export function SwitchDemo() {
  const [wifi, setWifi] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', justifyItems: 'start' }}>
      <form data-testid="switch-form">
        <CrSwitch label="Wi-Fi" name="wifi" checked={wifi} onCrChange={(event) => setWifi(event.detail)} />
      </form>
      <p data-testid="switch-value">{wifi ? 'activé' : 'désactivé'}</p>
      <CrSwitch label="Mode avion" checked disabled />
    </div>
  );
}
