'use client';

import { useState } from 'react';
import { CrButton, CrDatePicker } from '@cristal/react';

export function DatePickerDemo() {
  const [delivery, setDelivery] = useState('2025-03-14');
  const [sent, setSent] = useState('');

  return (
    <form
      data-testid="date-form"
      style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', justifyItems: 'start', maxWidth: 320 }}
      onSubmit={(event) => {
        event.preventDefault();
        setSent(String(new FormData(event.currentTarget).get('delivery')));
      }}
    >
      <CrDatePicker label="Date de livraison" name="delivery" value={delivery} min="2025-03-03" max="2025-04-30" required onCrChange={(event) => setDelivery(event.detail)} />
      <p data-testid="date-value">{delivery}</p>
      <CrDatePicker label="Date de naissance" name="birth" />
      <CrButton type="submit">Planifier la livraison</CrButton>
      <p data-testid="date-sent">{sent}</p>
    </form>
  );
}
