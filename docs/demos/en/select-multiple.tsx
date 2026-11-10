'use client';

import { useState } from 'react';
import { CrSelect } from '@cristal/react';

export default function SelectMultiple() {
  const [languages, setLanguages] = useState<string[]>(['en']);

  return (
    <>
      <CrSelect
        label="Languages spoken"
        name="languages"
        placeholder="Choose languages"
        multiple
        values={languages}
        onCrChange={(event) => setLanguages(event.detail as string[])}
      >
        <option value="en">English</option>
        <option value="fr">French</option>
        <option value="es">Spanish</option>
        <option value="de">German</option>
      </CrSelect>
      <output>Values: {JSON.stringify(languages)}</output>
    </>
  );
}
