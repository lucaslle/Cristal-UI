'use client';

import { useState } from 'react';
import { CrBox, CrRating } from '@cristal/react';

export default function RatingBasic() {
  const [rating, setRating] = useState(0);

  return (
    <CrBox display="flex" direction="column" gap="lg">
      <CrRating label="Rate the delivery" name="review" value={rating} onCrChange={(event) => setRating(event.detail)} />
      <p>Submitted rating: {rating ? `${rating} out of 5` : 'none'}</p>
      <CrRating label="Customer rating" value={4} readonly />
      <CrRating label="Order rating (already sent)" value={2} disabled />
    </CrBox>
  );
}
