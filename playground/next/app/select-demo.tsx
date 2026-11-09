'use client';

import { useState } from 'react';
import { CrButton, CrSelect } from '@cristal/react';

const languages = ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Portugais', 'Néerlandais', 'Japonais'];
const cities = ['Paris', 'Lyon', 'Marseille', 'Lille', 'Bordeaux', 'Nantes', 'Strasbourg', 'Évry', 'Écully', 'Toulouse'];

export function SelectDemo() {
  const [sent, setSent] = useState('');

  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cr-spacing-lg)', maxWidth: 400 }}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSent(JSON.stringify({ languages: data.getAll('languages'), city: data.get('city') }));
      }}
    >
      <CrSelect label="Langues parlées" name="languages" placeholder="Choisir des langues" multiple searchable required>
        {languages.map((language) => (
          <option key={language} value={language.toLowerCase()}>
            {language}
          </option>
        ))}
      </CrSelect>
      <CrSelect label="Ville" name="city" placeholder="Choisir une ville" searchable>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </CrSelect>
      <div style={{ display: 'flex', gap: 'var(--cr-spacing-sm)' }}>
        <CrButton type="submit">Valider</CrButton>
        <CrButton type="reset" variant="secondary">
          Effacer
        </CrButton>
      </div>
      <p data-testid="select-sent">Envoyé : {sent}</p>
    </form>
  );
}
