'use client';

import { useState } from 'react';
import { CrBox, CrRadioGroup } from '@cristal/react';

export default function RadioGroupBasic() {
  const [delivery, setDelivery] = useState('standard');

  return (
    <CrBox display="flex" direction="column" gap="lg">
      <CrRadioGroup label="Delivery method" name="delivery" required value={delivery} onCrChange={(event) => setDelivery(event.detail)}>
        <option value="standard">Standard, 3 to 5 days</option>
        <option value="express">Express, 24 h</option>
        <option value="relay" disabled>
          Pickup point (unavailable)
        </option>
        <option value="store">In-store pickup</option>
      </CrRadioGroup>
      <p>Chosen delivery: {delivery}</p>
    </CrBox>
  );
}
