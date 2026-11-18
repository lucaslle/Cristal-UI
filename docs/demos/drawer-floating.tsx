'use client';

import { useState } from 'react';
import { CrButton, CrDrawer, CrInput, CrTextarea } from '@cristal/react';

export default function DrawerFloating() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CrButton variant="secondary" onClick={() => setOpen(true)}>
        Ajouter une note
      </CrButton>

      <CrDrawer label="Nouvelle note" variant="floating" movable resizable open={open} onCrClose={() => setOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cr-spacing-lg)' }}>
          <CrInput label="Titre" />
          <CrTextarea label="Note" rows={4} />
        </div>
        <CrButton slot="footer" onClick={() => setOpen(false)}>
          Enregistrer
        </CrButton>
      </CrDrawer>
    </>
  );
}
