import { CrButton, CrTooltip } from '@cristal/react';

export default function TooltipBasic() {
  return (
    <>
      <CrTooltip text="Copies the page address">
        <CrButton variant="outline">Copy link</CrButton>
      </CrTooltip>
      <CrTooltip text="From the delivery date" placement="bottom">
        <a href="#accessibility">30-day returns</a>
      </CrTooltip>
    </>
  );
}
