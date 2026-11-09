'use client';

import { useState } from 'react';
import { CrSelect } from '@cristal/react';

export default function SelectMultiple() {
  const [languages, setLanguages] = useState<string[]>(['fr']);

  return (
    <>
      <CrSelect
        label="Langues parlées"
        name="languages"
        placeholder="Choisir des langues"
        multiple
        values={languages}
        onCrChange={(event) => setLanguages(event.detail as string[])}
      >
        <option value="fr">Français</option>
        <option value="en">Anglais</option>
        <option value="es">Espagnol</option>
        <option value="de">Allemand</option>
      </CrSelect>
      <output>Valeurs : {JSON.stringify(languages)}</output>
    </>
  );
}
