'use client';

import { useState } from 'react';
import { CrBox, CrSegmented, CrTabPanel } from '@cristal/react';

const variants = ['underline', 'thumb'] as const;

export default function SegmentedTabs() {
  const [tab, setTab] = useState('description');

  return (
    <CrBox display="flex" direction="column" gap="xl">
      {variants.map((variant) => (
        <CrSegmented key={variant} label={`Product sheet, ${variant} style`} variant={variant} fit value={tab} onCrChange={(event) => setTab(event.detail)}>
          <CrTabPanel label="Description" value="description">
            <p>Solid oak desk lamp, washed linen shade.</p>
          </CrTabPanel>
          <CrTabPanel label="Specifications" value="specs">
            <p>Height 45 cm, E27 bulb included, 2 m fabric cable.</p>
          </CrTabPanel>
          <CrTabPanel label="Reviews (128)" value="reviews">
            <p>4.6 out of 5: “Lovely warm light, assembled in two minutes.”</p>
          </CrTabPanel>
        </CrSegmented>
      ))}
    </CrBox>
  );
}
