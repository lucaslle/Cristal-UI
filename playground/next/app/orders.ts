export const orderColumns = [
  { key: 'amount', label: 'Montant', width: 120, align: 'end' as const, pinned: true },
  {
    key: 'status',
    label: 'Statut',
    width: 150,
    badges: { Payée: 'success' as const, Expédiée: 'primary' as const, 'En attente': 'warning' as const, Remboursée: 'danger' as const },
  },
  { key: 'channel', label: 'Canal', width: 120 },
  { key: 'region', label: 'Région', width: 110 },
  { key: 'product', label: 'Produit', width: 280 },
  { key: 'units', label: 'Unités', width: 100, align: 'end' as const },
  { key: 'discount', label: 'Remise', width: 100, align: 'end' as const },
];

const products = [
  ['Bureau réglable en hauteur', 'Payée', 'Web', 'Nord', '1 240,50 €', 2, '10 %'],
  ['Lampe articulée de bureau', 'Expédiée', 'Boutique', 'Centre', '318,00 €', 4, '–'],
  ['Chaise ergonomique', 'En attente', 'Grossiste', 'Côte', '4 860,00 €', 12, '15 %'],
  ['Étagère murale modulable', 'Payée', 'Appli', 'Sud', '189,90 €', 1, '–'],
  ['Table pliante en chêne', 'Remboursée', 'Web', 'Est', '540,00 €', 2, '5 %'],
  ['Établi avec tiroirs', 'Expédiée', 'Boutique', 'Nord', '772,40 €', 1, '–'],
  ['Support double écran', 'Payée', 'Web', 'Côte', '612,00 €', 6, '8 %'],
  ['Range-câbles adhésif', 'En attente', 'Appli', 'Centre', '216,00 €', 24, '–'],
];

export const orderRows = products.map(([product, status, channel, region, amount, units, discount]) => ({ product, status, channel, region, amount, units, discount }));
