import { CrButton } from '@cristal-ui/react';
import { ChevronRight, Plus } from 'lucide-react';

export default function ButtonIcons() {
  return (
    <>
      <CrButton>
        <Plus slot="start" aria-hidden="true" />
        Ajouter un produit
      </CrButton>
      <CrButton variant="outline">
        Continuer
        <ChevronRight slot="end" aria-hidden="true" />
      </CrButton>
    </>
  );
}
