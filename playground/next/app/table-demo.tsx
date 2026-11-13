'use client';

import type React from 'react';
import { useState } from 'react';
import { CrCheckbox, CrSelect, CrTable } from '@cristal/react';
import { orderColumns, orderRows } from './orders';
import { StockTableDemo } from './stock-table-demo';

const logColumns = [
  { key: 'ref', label: 'Référence', width: 130 },
  { key: 'event', label: 'Événement', width: 200 },
  { key: 'level', label: 'Niveau', width: 120, badges: { Info: 'neutral' as const, Alerte: 'warning' as const } },
];
const events = ['Connexion', 'Export', 'Modification', 'Suppression'];
const logRows = Array.from({ length: 1000 }, (_, i) => ({ ref: `LOG-${1001 + i}`, event: events[i % 4], level: i % 7 ? 'Info' : 'Alerte' }));

const variants = ['default', 'striped', 'cards', 'minimal', 'grid'] as const;
type Variant = (typeof variants)[number];

export function TableDemo() {
  const [variant, setVariant] = useState<Variant>('default');
  const [alerts, setAlerts] = useState(false);

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
      <CrTable label="Journal" columns={logColumns} rows={alerts ? logRows.filter((row) => row.level === 'Alerte') : logRows} density="compact" style={{ '--cr-table-max-height': '320px' } as React.CSSProperties} />
      <CrCheckbox label="Alertes seulement" checked={alerts} onCrChange={(event) => setAlerts(event.detail)} />
      <StockTableDemo />
    </div>
  );
}
