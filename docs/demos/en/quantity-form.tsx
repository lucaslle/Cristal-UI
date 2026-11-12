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
        setSent(`${new FormData(event.currentTarget).get('boxes')} boxes ordered.`);
      }}
    >
      <CrQuantity label="Boxes" name="boxes" hint="In packs of 5, from 5 to 50." min={5} max={50} step={5} required errorAnimation="zigzag" onCrInput={() => setSent('')} />
      <CrBox display="flex" gap="sm">
        <CrButton type="submit">Order</CrButton>
        <CrButton type="reset" variant="secondary">
          Cancel
        </CrButton>
      </CrBox>
      <p role="status" style={{ margin: 0 }}>
        {sent}
      </p>
    </form>
  );
}
