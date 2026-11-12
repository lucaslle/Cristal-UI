'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrQuantity } from '@cristal/react';

export default function QuantityForm() {
  const [sent, setSent] = useState('');

  return (
    <form
      style={{ display: 'grid', gap: 24, justifyItems: 'start' }}
      onSubmit={(event) => {
        event.preventDefault();
        setSent(`${new FormData(event.currentTarget).get('cartons')} cartons commandés.`);
      }}
    >
      <CrQuantity label="Cartons" name="cartons" hint="Par lot de 5, de 5 à 50." min={5} max={50} step={5} required errorAnimation="zigzag" onCrInput={() => setSent('')} />
      <CrBox display="flex" gap="sm">
        <CrButton type="submit">Commander</CrButton>
        <CrButton type="reset" variant="secondary">
          Annuler
        </CrButton>
      </CrBox>
      <p role="status" style={{ margin: 0 }}>
        {sent}
      </p>
    </form>
  );
}
