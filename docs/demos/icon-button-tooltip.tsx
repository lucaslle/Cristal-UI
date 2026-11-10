import { CrIconButton } from '@cristal/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

export default function IconButtonTooltip() {
  return (
    <>
      <CrIconButton label="Au-dessus" variant="outline" tooltipPlacement="top">
        <ArrowUp aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="En dessous" variant="outline" tooltipPlacement="bottom">
        <ArrowDown aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="À gauche" variant="outline" tooltipPlacement="start">
        <ArrowLeft aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="À droite" variant="outline" tooltipPlacement="end">
        <ArrowRight aria-hidden="true" />
      </CrIconButton>
    </>
  );
}
