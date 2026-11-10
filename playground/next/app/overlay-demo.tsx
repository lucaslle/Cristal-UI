'use client';

import { useState } from 'react';
import { CrButton, CrDialog, CrDrawer, CrInput, CrMenu, CrSelect } from '@cristal/react';

export function OverlayDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [result, setResult] = useState('');

  return (
    <div style={{ display: 'flex', gap: 'var(--cr-spacing-sm)', alignItems: 'center' }}>
      <CrButton onClick={() => setDialogOpen(true)}>Supprimer le produit</CrButton>
      <CrButton variant="secondary" onClick={() => setDrawerOpen(true)}>
        Filtres
      </CrButton>
      <span data-testid="overlay-result">{result}</span>

      <CrDialog label="Supprimer le produit ?" closeOnBackdrop={false} open={dialogOpen} onCrClose={() => setDialogOpen(false)}>
        <p>Cette action est définitive.</p>
        <CrButton slot="footer" variant="secondary" onClick={() => setDialogOpen(false)}>
          Annuler
        </CrButton>
        <CrButton
          slot="footer"
          onClick={() => {
            setResult('Produit supprimé');
            setDialogOpen(false);
          }}
        >
          Supprimer
        </CrButton>
      </CrDialog>

      <CrDrawer label="Filtres" open={drawerOpen} onCrClose={() => setDrawerOpen(false)}>
        <CrInput label="Prix maximum" type="number" />
        <CrMenu label="Plus d'options" accessibleLabel="Plus d'options des filtres" animation="anchor-pop">
          <option value="export">Exporter</option>
          <option value="reset">Effacer les filtres</option>
        </CrMenu>
        <CrSelect label="Tri" placeholder="Choisir un tri" animation="drum-roll">
          <option value="price">Prix croissant</option>
          <option value="name">Nom</option>
        </CrSelect>
        <CrButton slot="footer" onClick={() => setDrawerOpen(false)}>
          Appliquer
        </CrButton>
      </CrDrawer>
    </div>
  );
}
