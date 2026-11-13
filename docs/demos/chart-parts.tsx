'use client';

import { useState } from 'react';
import { CrChart, CrSegmented } from '@cristal/react';

const channels = ['Web', 'Boutique', 'Appli', 'Grossiste', 'Téléphone', 'Salons', 'Marketplace'];
const orders = [1840, 1210, 760, 420, 180, 90, 60];

export default function ChartParts() {
  const [type, setType] = useState('bar');

  return (
    <div style={{ display: 'grid', gap: 16, width: '100%' }}>
      <CrSegmented label="Type de graphique" value={type} onCrChange={(event) => setType(event.detail)}>
        <option value="bar">Barres</option>
        <option value="donut">Donut</option>
      </CrSegmented>
      <CrChart label="Commandes par canal" type={type as 'bar' | 'donut'} labels={channels} series={[{ name: 'Commandes', values: orders }]} />
    </div>
  );
}
