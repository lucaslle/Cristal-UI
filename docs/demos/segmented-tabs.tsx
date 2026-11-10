'use client';

import { useState } from 'react';
import { CrBox, CrSegmented, CrTabPanel } from '@cristal/react';

const variants = ['underline', 'thumb'] as const;

export default function SegmentedTabs() {
  const [tab, setTab] = useState('description');

  return (
    <CrBox display="flex" direction="column" gap="xl">
      {variants.map((variant) => (
        <CrSegmented key={variant} label={`Fiche produit, style ${variant}`} variant={variant} fit value={tab} onCrChange={(event) => setTab(event.detail)}>
          <CrTabPanel label="Description" value="description">
            <p>Lampe de bureau en chêne massif, abat-jour en lin lavé.</p>
          </CrTabPanel>
          <CrTabPanel label="Caractéristiques" value="specs">
            <p>Hauteur 45 cm, ampoule E27 fournie, câble textile de 2 m.</p>
          </CrTabPanel>
          <CrTabPanel label="Avis (128)" value="reviews">
            <p>4,6 sur 5 : « Belle lumière chaude, montage en deux minutes. »</p>
          </CrTabPanel>
        </CrSegmented>
      ))}
    </CrBox>
  );
}
