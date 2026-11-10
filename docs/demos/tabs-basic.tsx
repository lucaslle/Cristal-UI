'use client';

import { useState } from 'react';
import { CrTabPanel, CrTabs } from '@cristal/react';

export default function TabsBasic() {
  const [tab, setTab] = useState(0);

  return (
    <CrTabs selected={tab} onCrChange={(event) => setTab(event.detail)}>
      <CrTabPanel label="Description">
        <p>Lampe de bureau en chêne massif, abat-jour en lin lavé.</p>
      </CrTabPanel>
      <CrTabPanel label="Caractéristiques">
        <p>Hauteur 45 cm, ampoule E27 fournie, câble textile de 2 m.</p>
      </CrTabPanel>
      <CrTabPanel label="Avis (128)">
        <p>4,6 sur 5 : « Belle lumière chaude, montage en deux minutes. »</p>
      </CrTabPanel>
    </CrTabs>
  );
}
