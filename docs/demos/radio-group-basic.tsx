'use client';

import { useState } from 'react';
import { CrBox, CrRadioGroup } from '@cristal/react';

export default function RadioGroupBasic() {
  const [delivery, setDelivery] = useState('standard');

  return (
    <CrBox display="flex" direction="column" gap="lg">
      <CrRadioGroup label="Mode de livraison" name="delivery" required value={delivery} onCrChange={(event) => setDelivery(event.detail)}>
        <option value="standard">Standard, 3 à 5 jours</option>
        <option value="express">Express, 24 h</option>
        <option value="relay" disabled>
          Point relais (indisponible)
        </option>
        <option value="store">Retrait en magasin</option>
      </CrRadioGroup>
      <p>Livraison choisie : {delivery}</p>
    </CrBox>
  );
}
