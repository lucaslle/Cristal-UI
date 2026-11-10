'use client';

import { useState } from 'react';
import { CrTabPanel, CrTabs } from '@cristal/react';

export default function TabsBasic() {
  const [tab, setTab] = useState(0);

  return (
    <CrTabs selected={tab} onCrChange={(event) => setTab(event.detail)}>
      <CrTabPanel label="Description">
        <p>Solid oak desk lamp, washed linen shade.</p>
      </CrTabPanel>
      <CrTabPanel label="Specifications">
        <p>Height 45 cm, E27 bulb included, 2 m fabric cable.</p>
      </CrTabPanel>
      <CrTabPanel label="Reviews (128)">
        <p>4.6 out of 5: “Lovely warm light, assembled in two minutes.”</p>
      </CrTabPanel>
    </CrTabs>
  );
}
