'use client';

import { useState } from 'react';
import { CrButton, CrCheckbox, CrInput, CrSelect } from '@cristal/react';

export default function FormComplete() {
  const [sent, setSent] = useState('');

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <CrInput label="Email" name="email" type="email" required />
      <CrSelect label="Country" name="country" placeholder="Choose a country" required>
        <option value="us">United States</option>
        <option value="gb">United Kingdom</option>
        <option value="ca">Canada</option>
      </CrSelect>
      <CrCheckbox label="I accept the terms" name="terms" required />
      <div className="flex gap-2">
        <CrButton type="submit">Submit</CrButton>
        <CrButton type="reset" variant="secondary">
          Reset
        </CrButton>
      </div>
      {sent && <output>Submitted data: {sent}</output>}
    </form>
  );
}
