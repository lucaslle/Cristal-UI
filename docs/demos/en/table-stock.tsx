'use client';

import { useState } from 'react';
import { CrButton, CrTable } from '@cristal/react';

const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const columns = [
  { key: 'name', label: 'Product', width: 220, sortable: true, primary: true },
  { key: 'quantity', label: 'Quantity', width: 130, align: 'end' as const, sortable: true },
  { key: 'price', label: 'Price', width: 130, align: 'end' as const, sortable: true, format: (value: unknown) => dollars.format(value as number) },
  { key: 'actions', label: 'Actions', width: 150, slot: true },
];

const rows = [
  { id: 1, name: '27-inch monitor', quantity: 12, price: 329 },
  { id: 2, name: 'USB-C cable', quantity: 140, price: 9.9 },
  { id: 3, name: 'Mechanical keyboard', quantity: 0, price: 89 },
  { id: 4, name: 'Wireless mouse', quantity: 45, price: 24.5 },
  { id: 5, name: 'Headphones', quantity: 8, price: 1290 },
];

export default function TableStock() {
  const [selected, setSelected] = useState<unknown[]>([]);
  const [last, setLast] = useState('—');

  return (
    <div style={{ display: 'grid', gap: 12, width: '100%' }}>
      <CrTable
        label="Stock"
        columns={columns}
        rows={rows}
        selectable
        selected={selected}
        onCrSelectionChange={(event) => setSelected(event.detail)}
        onCrRowClick={(event) => setLast(`open ${event.detail.name}`)}
      >
        {rows.map((row) => (
          <CrButton key={row.id} slot={`actions-${row.id}`} size="xs" variant="outline" onClick={() => setLast(`restock ${row.name}`)}>
            Restock
          </CrButton>
        ))}
      </CrTable>
      <p>
        {selected.length} {selected.length === 1 ? 'row' : 'rows'} checked · last action: {last}
      </p>
    </div>
  );
}
