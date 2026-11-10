'use client';

import { useState } from 'react';
import { CrBox, CrDatePicker } from '@cristal/react';

export default function DatePickerBasic() {
  const [date, setDate] = useState('2025-06-12');

  return (
    <CrBox display="flex" direction="column" gap="lg" style={{ width: '100%', maxWidth: 320 }}>
      <CrDatePicker label="Appointment date" name="appointment" value={date} min="2025-06-02" max="2025-07-31" required onCrChange={(event) => setDate(event.detail)} />
      <CrDatePicker label="Date of birth" name="birth" />
      <CrDatePicker label="Sign-up date" value="2024-09-01" disabled />
      <p>Submitted value: {date || '(none)'}</p>
    </CrBox>
  );
}
