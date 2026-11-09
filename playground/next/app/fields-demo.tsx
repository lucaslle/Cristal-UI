'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrCardInput, CrInput, CrOtp, CrTagInput, CrTextarea } from '@cristal/react';

const emails = ['mia@mail.com', 'mia.dupont@entreprise.fr', 'lucas@exemple.fr'];

export function FieldsDemo() {
  const [sent, setSent] = useState('');
  const [complete, setComplete] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSent(JSON.stringify(Object.fromEntries(Array.from(data.keys()).map((key) => [key, data.getAll(key).join('|')]))));
      }}
    >
      <CrBox display="grid" columns="300px" gap="xl" padding="xl" background="muted" radius="l" border>
        <CrBox display="flex" direction="column" gap="sm">
          <CrOtp label="Code reçu par SMS" name="code" hint="6 chiffres" onCrComplete={(event) => setComplete(event.detail)} />
          <p role="status">{complete && `Code complet : ${complete}`}</p>
        </CrBox>
        <CrCardInput label="Carte bancaire" name="card" hint="Carte de test : 4242 4242 4242 4242" preview />
        <CrInput label="Nouveau mot de passe" name="password" type="password" autocomplete="new-password" strength />
        <CrTextarea label="Note" name="note" placeholder="Écrivez une note…" maxRows={5}>
          <CrButton slot="end" size="xs" aria-label="Envoyer la note" type="submit">
            ↑
          </CrButton>
        </CrTextarea>
        <CrTagInput label="Sujets" name="topics" placeholder="design, animation…" values={['design', 'animation']} />
        <CrInput label="Adresse de contact" name="contact" type="email" completions={emails} hint="Flèche droite pour accepter la suggestion" />
      </CrBox>
      <CrBox display="flex" gap="sm" align="center" padding="lg 0">
        <CrButton type="submit">Soumettre</CrButton>
        <CrButton type="reset" variant="secondary">
          Remettre à zéro
        </CrButton>
      </CrBox>
      <p data-testid="fields-sent">Envoyé : {sent}</p>
    </form>
  );
}
