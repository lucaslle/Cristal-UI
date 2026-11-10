'use client';

import { useState } from 'react';
import { CrButton, CrDialog } from '@cristal/react';

export default function DialogConfirm() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');

  return (
    <>
      <CrButton onClick={() => setOpen(true)}>Delete product</CrButton>
      <span role="status">{status}</span>

      <CrDialog label="Delete this product?" open={open} onCrClose={() => setOpen(false)}>
        <p>This action cannot be undone.</p>
        <CrButton slot="footer" variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </CrButton>
        <CrButton
          slot="footer"
          onClick={() => {
            setStatus('Product deleted.');
            setOpen(false);
          }}
        >
          Delete
        </CrButton>
      </CrDialog>
    </>
  );
}
