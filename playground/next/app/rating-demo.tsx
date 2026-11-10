'use client';

import { useState } from 'react';
import { CrRating } from '@cristal/react';

export function RatingDemo() {
  const [rating, setRating] = useState(3);

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', justifyItems: 'start' }}>
      <form data-testid="rating-form">
        <CrRating label="Note du produit" name="note" value={rating} onCrChange={(event) => setRating(event.detail)} />
      </form>
      <p data-testid="rating-value">{rating}</p>
      <CrRating label="Note moyenne" value={4} readonly />
      <CrRating label="Note de la commande" value={2} disabled />
    </div>
  );
}
