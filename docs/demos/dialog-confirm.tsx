'use client';

import { useState } from 'react';
import { CrButton, CrDialog } from '@cristal-ui/react';

export default function DialogConfirm() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');

  return (
    <>
      <CrButton onClick={() => setOpen(true)}>Supprimer le produit</CrButton>
      <span role="status">{status}</span>

      <CrDialog label="Supprimer le produit ?" open={open} onCrClose={() => setOpen(false)}>
        <p>Cette action est définitive.</p>
        <CrButton slot="footer" variant="secondary" onClick={() => setOpen(false)}>
          Annuler
        </CrButton>
        <CrButton
          slot="footer"
          onClick={() => {
            setStatus('Produit supprimé.');
            setOpen(false);
          }}
        >
          Supprimer
        </CrButton>
      </CrDialog>
    </>
  );
}
