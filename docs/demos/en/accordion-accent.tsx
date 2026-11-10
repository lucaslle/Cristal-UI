import { CrAccordion, CrAccordionItem } from '@cristal/react';

export default function AccordionAccent() {
  return (
    <CrAccordion animation="accent-bar" numbered style={{ width: '100%' }}>
      <CrAccordionItem label="Design">Mockups and user flows approved with the team.</CrAccordionItem>
      <CrAccordionItem label="Development">Components, tests and continuous integration.</CrAccordionItem>
      <CrAccordionItem label="Launch">Go live and follow up on early feedback.</CrAccordionItem>
    </CrAccordion>
  );
}
