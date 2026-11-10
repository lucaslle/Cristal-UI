'use client';

import { useState } from 'react';
import { CrButton, CrCheckbox, CrDrawer, CrInput } from '@cristal/react';

export default function DrawerFilters() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CrButton variant="secondary" onClick={() => setOpen(true)}>
        Filters
      </CrButton>

      <CrDrawer label="Filters" open={open} onCrClose={() => setOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cr-spacing-lg)' }}>
          <CrInput label="Maximum price" type="number" hint="In dollars" />
          <CrCheckbox label="In stock only" />
        </div>
        <CrButton slot="footer" onClick={() => setOpen(false)}>
          Apply
        </CrButton>
      </CrDrawer>
    </>
  );
}
