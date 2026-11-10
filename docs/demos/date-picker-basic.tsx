'use client';

import { useState } from 'react';
import { CrBox, CrDatePicker } from '@cristal/react';

export default function DatePickerBasic() {
  const [date, setDate] = useState('2025-06-12');

  return (
    <CrBox display="flex" direction="column" gap="lg" style={{ width: '100%', maxWidth: 320 }}>
      <CrDatePicker label="Date du rendez-vous" name="rendez-vous" value={date} min="2025-06-02" max="2025-07-31" required onCrChange={(event) => setDate(event.detail)} />
      <CrDatePicker label="Date de naissance" name="naissance" />
      <CrDatePicker label="Date d'inscription" value="2024-09-01" disabled />
      <p>Valeur envoyée : {date || '(aucune)'}</p>
    </CrBox>
  );
}
