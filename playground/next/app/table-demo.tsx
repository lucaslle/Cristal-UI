'use client';

import { useState } from 'react';
import { CrSelect, CrTable } from '@cristal/react';
import { orderColumns, orderRows } from './orders';

const variants = ['default', 'striped', 'cards', 'minimal', 'grid'] as const;
type Variant = (typeof variants)[number];

export function TableDemo() {
  const [variant, setVariant] = useState<Variant>('default');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cr-spacing-lg)' }}>
      <div style={{ maxWidth: 240 }}>
        <CrSelect label="Style du tableau" value={variant} onCrChange={(event) => setVariant(event.detail as Variant)}>
          {variants.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </CrSelect>
      </div>
      <CrTable label="Commandes de la semaine" variant={variant} columns={orderColumns} rows={orderRows} storageKey="playground-orders" />
    </div>
  );
}
