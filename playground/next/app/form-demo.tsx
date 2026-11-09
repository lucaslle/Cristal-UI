'use client';

import { useState } from 'react';
import { CrButton, CrCheckbox, CrInput, CrSelect } from '@cristal/react';

const column = { display: 'flex', flexDirection: 'column', gap: 'var(--cr-spacing-lg)', maxWidth: 400 } as const;

export function FormDemo() {
  const [clicks, setClicks] = useState(0);
  const [submitted, setSubmitted] = useState('');

  return (
    <form
      style={column}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <CrInput label="E-mail" name="email" type="email" value="lucas@example.com" hint="Format : nom@domaine.fr" required />
      <CrSelect label="Pays" name="country" placeholder="Choisir un pays" animation="card-deal" required>
        <option value="fr">France</option>
        <option value="be">Belgique</option>
        <option value="ch">Suisse</option>
      </CrSelect>
      <CrCheckbox label="J'accepte les conditions" name="terms" required />
      <div style={{ display: 'flex', gap: 'var(--cr-spacing-sm)' }}>
        <CrButton type="submit">Envoyer</CrButton>
        <CrButton type="reset" variant="secondary">
          Réinitialiser
        </CrButton>
        <CrButton variant="outline" onClick={() => setClicks((count) => count + 1)}>
          Compter
        </CrButton>
      </div>
      <p data-testid="clicks">Clics : {clicks}</p>
      <p data-testid="submitted">Envoyé : {submitted}</p>
    </form>
  );
}
