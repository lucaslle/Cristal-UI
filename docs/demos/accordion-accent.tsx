import { CrAccordion, CrAccordionItem } from '@cristal/react';

export default function AccordionAccent() {
  return (
    <CrAccordion animation="accent-bar" numbered style={{ width: '100%' }}>
      <CrAccordionItem label="Conception">Maquettes et parcours validés avec l'équipe.</CrAccordionItem>
      <CrAccordionItem label="Développement">Composants, tests et intégration continue.</CrAccordionItem>
      <CrAccordionItem label="Lancement">Mise en ligne et suivi des premiers retours.</CrAccordionItem>
    </CrAccordion>
  );
}
