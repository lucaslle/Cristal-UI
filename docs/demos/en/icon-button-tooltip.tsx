import { CrIconButton } from '@cristal/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

export default function IconButtonTooltip() {
  return (
    <>
      <CrIconButton label="Above" variant="outline" tooltipPlacement="top">
        <ArrowUp aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="Below" variant="outline" tooltipPlacement="bottom">
        <ArrowDown aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="Left" variant="outline" tooltipPlacement="start">
        <ArrowLeft aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="Right" variant="outline" tooltipPlacement="end">
        <ArrowRight aria-hidden="true" />
      </CrIconButton>
    </>
  );
}
