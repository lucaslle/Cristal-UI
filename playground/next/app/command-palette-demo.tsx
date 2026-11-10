'use client';

import { useState } from 'react';
import { CrButton, CrCommandPalette } from '@cristal/react';

export function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState('');
  const [closed, setClosed] = useState(0);

  return (
    <div style={{ display: 'flex', gap: 'var(--cr-spacing-sm)', alignItems: 'center' }}>
      <CrButton variant="outline" onClick={() => setOpen(true)}>
        Ouvrir la palette (Ctrl+K)
      </CrButton>
      <span data-testid="palette-chosen">{chosen}</span>
      <span data-testid="palette-closed">{closed}</span>
      <CrCommandPalette
        label="Palette de commandes"
        open={open}
        onCrSelect={(event) => setChosen(event.detail)}
        onCrClose={() => {
          setOpen(false);
          setClosed((count) => count + 1);
        }}
      >
        <option value="home" data-group="Navigation">
          Accueil
        </option>
        <option value="orders" data-group="Navigation">
          Commandes
        </option>
        <option value="settings" data-group="Navigation">
          Paramètres
        </option>
        <option value="invoice" data-group="Actions">
          Créer une facture
        </option>
        <option value="export" data-group="Actions">
          Exporter en CSV
        </option>
        <option value="archive" data-group="Actions" disabled>
          Archiver (indisponible)
        </option>
        <option value="logout" data-group="Actions">
          Se déconnecter
        </option>
      </CrCommandPalette>
    </div>
  );
}
