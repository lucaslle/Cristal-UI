'use client';

import { useState } from 'react';
import { CrSelect, CrTable } from '@cristal/react';

const columns = [
  { key: 'amount', label: 'Amount', width: 120, align: 'end' as const, pinned: true },
  {
    key: 'status',
    label: 'Status',
    width: 150,
    badges: { Paid: 'success' as const, Shipped: 'primary' as const, Pending: 'warning' as const, Refunded: 'danger' as const },
  },
  { key: 'channel', label: 'Channel', width: 120 },
  { key: 'region', label: 'Region', width: 110 },
  { key: 'product', label: 'Product', width: 260 },
  { key: 'units', label: 'Units', width: 100, align: 'end' as const },
];

const rows = [
  { amount: '$1,240.50', status: 'Paid', channel: 'Web', region: 'North', product: 'Height-adjustable desk', units: 2 },
  { amount: '$318.00', status: 'Shipped', channel: 'Store', region: 'Central', product: 'Swing-arm desk lamp', units: 4 },
  { amount: '$4,860.00', status: 'Pending', channel: 'Wholesale', region: 'Coast', product: 'Ergonomic chair', units: 12 },
  { amount: '$189.90', status: 'Paid', channel: 'App', region: 'South', product: 'Modular wall shelf', units: 1 },
  { amount: '$540.00', status: 'Refunded', channel: 'Web', region: 'East', product: 'Folding oak table', units: 2 },
  { amount: '$772.40', status: 'Shipped', channel: 'Store', region: 'North', product: 'Workbench with drawers', units: 1 },
];

const variants = ['default', 'striped', 'cards', 'minimal', 'grid'] as const;

export default function TableOrders() {
  const [variant, setVariant] = useState<(typeof variants)[number]>('default');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      <CrSelect label="Style" value={variant} onCrChange={(event) => setVariant(event.detail as typeof variant)} style={{ maxWidth: 220 }}>
        {variants.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </CrSelect>
      <CrTable label="This week's orders" variant={variant} columns={columns} rows={rows} storageKey="docs-commandes-en" />
    </div>
  );
}
