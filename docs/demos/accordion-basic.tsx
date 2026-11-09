import { CrAccordion, CrAccordionItem } from '@cristal/react';

export default function AccordionBasic() {
  return (
    <CrAccordion style={{ width: '100%' }}>
      <CrAccordionItem label="Livraison" open>
        Expédition sous 48 h, suivi envoyé par e-mail.
      </CrAccordionItem>
      <CrAccordionItem label="Retours">Vous avez 30 jours pour changer d'avis.</CrAccordionItem>
      <CrAccordionItem label="Garantie">Deux ans, pièces et main-d'œuvre.</CrAccordionItem>
    </CrAccordion>
  );
}
