'use client';

import { useState } from 'react';
import { CrSelect, CrTable } from '@cristal/react';

const columns = [
  { key: 'amount', label: 'Montant', width: 120, align: 'end' as const, pinned: true },
  {
    key: 'status',
    label: 'Statut',
    width: 150,
    badges: { Payée: 'success' as const, Expédiée: 'primary' as const, 'En attente': 'warning' as const, Remboursée: 'danger' as const },
  },
  { key: 'channel', label: 'Canal', width: 120 },
  { key: 'region', label: 'Région', width: 110 },
  { key: 'product', label: 'Produit', width: 260 },
  { key: 'units', label: 'Unités', width: 100, align: 'end' as const },
];

const rows = [
  { amount: '1 240,50 €', status: 'Payée', channel: 'Web', region: 'Nord', product: 'Bureau réglable en hauteur', units: 2 },
  { amount: '318,00 €', status: 'Expédiée', channel: 'Boutique', region: 'Centre', product: 'Lampe articulée de bureau', units: 4 },
  { amount: '4 860,00 €', status: 'En attente', channel: 'Grossiste', region: 'Côte', product: 'Chaise ergonomique', units: 12 },
  { amount: '189,90 €', status: 'Payée', channel: 'Appli', region: 'Sud', product: 'Étagère murale modulable', units: 1 },
  { amount: '540,00 €', status: 'Remboursée', channel: 'Web', region: 'Est', product: 'Table pliante en chêne', units: 2 },
  { amount: '772,40 €', status: 'Expédiée', channel: 'Boutique', region: 'Nord', product: 'Établi avec tiroirs', units: 1 },
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
      <CrTable label="Commandes de la semaine" variant={variant} columns={columns} rows={rows} storageKey="docs-commandes" />
    </div>
  );
}
