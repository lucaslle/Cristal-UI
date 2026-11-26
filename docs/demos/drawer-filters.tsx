'use client';

import { useState } from 'react';
import { CrButton, CrCheckbox, CrDrawer, CrInput } from '@cristal-ui/react';

export default function DrawerFilters() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CrButton variant="secondary" onClick={() => setOpen(true)}>
        Filtres
      </CrButton>

      <CrDrawer label="Filtres" open={open} onCrClose={() => setOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cr-spacing-lg)' }}>
          <CrInput label="Prix maximum" type="number" hint="En euros" />
          <CrCheckbox label="En stock uniquement" />
        </div>
        <CrButton slot="footer" onClick={() => setOpen(false)}>
          Appliquer
        </CrButton>
      </CrDrawer>
    </>
  );
}
