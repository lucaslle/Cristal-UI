import { CrInput } from '@cristal/react';

const emails = ['mia@mail.com', 'mia.dupont@entreprise.fr', 'lucas@exemple.fr'];

export default function InputExtras() {
  return (
    <>
      <CrInput label="Nouveau mot de passe" type="password" autocomplete="new-password" strength />
      <CrInput label="E-mail" type="email" completions={emails} hint="Tapez « mia », puis flèche droite pour accepter la suggestion" />
    </>
  );
}
