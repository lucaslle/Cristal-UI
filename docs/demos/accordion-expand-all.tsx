import { CrAccordion, CrAccordionItem } from '@cristal/react';

export default function AccordionExpandAll() {
  return (
    <CrAccordion toggleAll style={{ width: '100%' }}>
      <CrAccordionItem label="Présentation">Une tarte fine aux pommes, prête en 45 minutes.</CrAccordionItem>
      <CrAccordionItem label="Ingrédients">4 pommes, 1 pâte feuilletée, 30 g de beurre, 2 cuillères de sucre.</CrAccordionItem>
      <CrAccordionItem label="Étapes">Étaler la pâte, couper les pommes en lamelles, cuire 25 minutes à 200 °C.</CrAccordionItem>
    </CrAccordion>
  );
}
