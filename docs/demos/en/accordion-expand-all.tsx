import { CrAccordion, CrAccordionItem } from '@cristal/react';

export default function AccordionExpandAll() {
  return (
    <CrAccordion toggleAll style={{ width: '100%' }}>
      <CrAccordionItem label="Overview">A thin apple tart, ready in 45 minutes.</CrAccordionItem>
      <CrAccordionItem label="Ingredients">4 apples, 1 sheet of puff pastry, 2 tbsp butter, 2 tbsp sugar.</CrAccordionItem>
      <CrAccordionItem label="Steps">Roll out the pastry, slice the apples thinly, bake for 25 minutes at 400 °F.</CrAccordionItem>
    </CrAccordion>
  );
}
