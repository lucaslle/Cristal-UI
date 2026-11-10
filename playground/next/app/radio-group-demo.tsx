'use client';

import { useState } from 'react';
import { CrButton, CrRadioGroup } from '@cristal/react';

export function RadioGroupDemo() {
  const [delivery, setDelivery] = useState('');
  const [sent, setSent] = useState('');

  return (
    <form
      data-testid="radio-form"
      style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', justifyItems: 'start' }}
      onSubmit={(event) => {
        event.preventDefault();
        setSent(String(new FormData(event.currentTarget).get('delivery')));
      }}
    >
      <CrRadioGroup label="Mode de livraison" name="delivery" required value={delivery} onCrChange={(event) => setDelivery(event.detail)}>
        <option value="standard">Standard, 3 à 5 jours</option>
        <option value="express">Express, 24 h</option>
        <option value="drone" disabled>
          Drone, indisponible
        </option>
        <option value="store">Retrait en magasin</option>
      </CrRadioGroup>
      <CrButton type="submit">Commander</CrButton>
      <p data-testid="radio-sent">{sent}</p>
    </form>
  );
}
