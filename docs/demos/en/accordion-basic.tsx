import { CrAccordion, CrAccordionItem } from '@cristal/react';

export default function AccordionBasic() {
  return (
    <CrAccordion style={{ width: '100%' }}>
      <CrAccordionItem label="Shipping" open>
        Ships within 48 hours, tracking sent by email.
      </CrAccordionItem>
      <CrAccordionItem label="Returns">You have 30 days to change your mind.</CrAccordionItem>
      <CrAccordionItem label="Warranty">Two years, parts and labor.</CrAccordionItem>
    </CrAccordion>
  );
}
