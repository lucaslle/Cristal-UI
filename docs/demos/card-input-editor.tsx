import { CrCardInput } from '@cristal/react';

export default function CardInputEditor() {
  return <CrCardInput label="Carte bancaire" name="card" variant="card" holder hint="Carte de test : 4242 4242 4242 4242" required />;
}
