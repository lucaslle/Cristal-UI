'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrNumber } from '@cristal/react';

export default function NumberFormat() {
  const [price, setPrice] = useState(1249.9);

  return (
    <CrBox display="flex" direction="column" gap="lg" align="start">
      <p style={{ margin: 0, fontSize: 24 }}>
        Total: $<CrNumber value={price} decimals={2} />
      </p>
      <p lang="fr" style={{ margin: 0, fontSize: 24 }}>
        Total : <CrNumber value={price} decimals={2} /> €
      </p>
      <p style={{ margin: 0, fontSize: 24 }}>
        Gap: $<CrNumber value={price - 1300} decimals={1} animation="count" />
      </p>
      <CrButton size="s" variant="secondary" onClick={() => setPrice(price === 1249.9 ? 1302.45 : 1249.9)}>
        Change the price
      </CrButton>
    </CrBox>
  );
}
