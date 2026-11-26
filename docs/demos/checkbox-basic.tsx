import { CrCheckbox } from '@cristal-ui/react';

export default function CheckboxBasic() {
  return (
    <>
      <CrCheckbox label="Recevoir la newsletter" name="newsletter" hint="Un e-mail par mois, désinscription en un clic." />
      <CrCheckbox label="Tout sélectionner" indeterminate />
      <CrCheckbox label="Option indisponible" disabled />
      <CrCheckbox label="J'accepte les conditions" error="Vous devez accepter les conditions pour continuer." />
    </>
  );
}
