'use client';

import { useState } from 'react';
import { CrTabPanel, CrTabs } from '@cristal/react';

export function TabsDemo() {
  const [tab, setTab] = useState(0);

  return (
    <div>
      <CrTabs data-testid="tabs" selected={tab} onCrChange={(event) => setTab(event.detail)}>
        <CrTabPanel label="Description">
          <p>Lampe de bureau en chêne, abat-jour en lin.</p>
        </CrTabPanel>
        <CrTabPanel label="Caractéristiques">
          <p>Hauteur 45 cm, ampoule E27 fournie.</p>
        </CrTabPanel>
        <CrTabPanel label="Avis">
          <p>4,6 sur 5, d'après 128 avis.</p>
        </CrTabPanel>
      </CrTabs>
      <p data-testid="tabs-value">{tab}</p>
    </div>
  );
}
