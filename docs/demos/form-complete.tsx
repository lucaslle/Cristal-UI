'use client';

import { useState } from 'react';
import { CrButton, CrCheckbox, CrInput, CrSelect } from '@cristal-ui/react';

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
      <CrInput label="E-mail" name="email" type="email" required />
      <CrSelect label="Pays" name="country" placeholder="Choisir un pays" required>
        <option value="fr">France</option>
        <option value="be">Belgique</option>
        <option value="ch">Suisse</option>
      </CrSelect>
      <CrCheckbox label="J'accepte les conditions" name="terms" required />
      <div className="flex gap-2">
        <CrButton type="submit">Envoyer</CrButton>
        <CrButton type="reset" variant="secondary">
          Réinitialiser
        </CrButton>
      </div>
      {sent && <output>Données envoyées : {sent}</output>}
    </form>
  );
}
