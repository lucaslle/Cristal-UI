'use client';

import { useState } from 'react';
import { CrBox, CrRating } from '@cristal/react';

export default function RatingBasic() {
  const [rating, setRating] = useState(0);

  return (
    <CrBox display="flex" direction="column" gap="lg">
      <CrRating label="Votre avis sur la livraison" name="avis" value={rating} onCrChange={(event) => setRating(event.detail)} />
      <p>Note envoyée : {rating ? `${rating} sur 5` : 'aucune'}</p>
      <CrRating label="Note des clients" value={4} readonly />
      <CrRating label="Note de la commande (déjà envoyée)" value={2} disabled />
    </CrBox>
  );
}
