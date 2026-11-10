import { CrButton } from '@cristal/react';
import { ChevronRight, Plus } from 'lucide-react';

export default function ButtonIcons() {
  return (
    <>
      <CrButton>
        <Plus slot="start" aria-hidden="true" />
        Add product
      </CrButton>
      <CrButton variant="outline">
        Continue
        <ChevronRight slot="end" aria-hidden="true" />
      </CrButton>
    </>
  );
}
