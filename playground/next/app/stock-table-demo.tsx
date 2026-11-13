'use client';

import { useState } from 'react';
import { CrButton, CrTable } from '@cristal/react';

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const columns = [
  { key: 'name', label: 'Produit', width: 220, sortable: true, primary: true },
  { key: 'quantity', label: 'Quantité', width: 130, align: 'end' as const, sortable: true },
  { key: 'price', label: 'Prix', width: 130, align: 'end' as const, sortable: true, format: (value: unknown) => euros.format(value as number) },
  { key: 'actions', label: 'Actions', width: 140, slot: true },
];

const rows = [
  { id: 1, name: 'Écran 27 pouces', quantity: 12, price: 329 },
  { id: 2, name: 'Câble USB-C', quantity: 140, price: 9.9 },
  { id: 3, name: 'Clavier mécanique', quantity: 0, price: 89 },
  { id: 4, name: 'Souris sans fil', quantity: 45, price: 24.5 },
  { id: 5, name: 'Casque audio', quantity: 8, price: 1290 },
];

export function StockTableDemo() {
  const [selected, setSelected] = useState<unknown[]>([2]);
  const [last, setLast] = useState('aucune');

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-sm)' }}>
      <CrTable
        label="Stock"
        columns={columns}
        rows={rows}
        selectable
        selected={selected}
        onCrSelectionChange={(event) => setSelected(event.detail)}
        onCrRowClick={(event) => setLast(`ouverte : ${event.detail.name}`)}
      >
        {rows.map((row) => (
          <CrButton key={row.id} slot={`actions-${row.id}`} size="xs" variant="outline" onClick={() => setLast(`réassort : ${row.name}`)}>
            Réassort
          </CrButton>
        ))}
      </CrTable>
      <p data-testid="stock-state">
        Cochées : {selected.join(', ') || 'aucune'} · Dernière action : {last}
      </p>
    </div>
  );
}
