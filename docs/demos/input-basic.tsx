import { CrInput } from '@cristal-ui/react';

export default function InputBasic() {
  return (
    <>
      <CrInput label="E-mail" type="email" name="email" hint="Format : nom@domaine.fr" autocomplete="email" required />
      <CrInput label="Nom" error="Le nom est obligatoire. Saisissez au moins 2 caractères." />
      <CrInput label="Référence" value="REF-001" disabled />
    </>
  );
}
