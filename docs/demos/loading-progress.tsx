'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrProgress } from '@cristal/react';

export default function LoadingProgress() {
  const [value, setValue] = useState(0);

  return (
    <CrBox display="flex" direction="column" gap="xl" style={{ width: '100%', maxWidth: 360 }}>
      <CrProgress label="Import des fichiers" />
      <CrProgress label="Téléversement" value={value} showValue />
      <CrButton size="s" variant="secondary" onClick={() => setValue(value === 100 ? 0 : 100)}>
        {value === 100 ? 'Remettre à zéro' : 'Lancer'}
      </CrButton>
    </CrBox>
  );
}
