'use client';

import { useState } from 'react';
import { CrChart, CrSegmented } from '@cristal/react';

const channels = ['Web', 'Store', 'App', 'Wholesale', 'Phone', 'Trade shows', 'Marketplace'];
const orders = [1840, 1210, 760, 420, 180, 90, 60];

export default function ChartParts() {
  const [type, setType] = useState('bar');

  return (
    <div style={{ display: 'grid', gap: 16, width: '100%' }}>
      <CrSegmented label="Chart type" value={type} onCrChange={(event) => setType(event.detail)}>
        <option value="bar">Bars</option>
        <option value="donut">Donut</option>
      </CrSegmented>
      <CrChart label="Orders by channel" type={type as 'bar' | 'donut'} labels={channels} series={[{ name: 'Orders', values: orders }]} />
    </div>
  );
}
