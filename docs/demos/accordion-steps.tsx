'use client';

import { useRef, useState } from 'react';
import { CrAccordion, CrAccordionItem, CrButton } from '@cristal/react';

export default function AccordionSteps() {
  const steps = useRef<HTMLCrAccordionElement>(null);
  const [complete, setComplete] = useState(false);
  const next = () => steps.current?.next();

  return (
    <div style={{ width: '100%' }}>
      <CrAccordion ref={steps} variant="steps" onCrComplete={() => setComplete(true)}>
        <CrAccordionItem label="Panier" open>
          <p>3 articles, 128,40 €</p>
          <CrButton size="s" onClick={next}>Continuer</CrButton>
        </CrAccordionItem>
        <CrAccordionItem label="Adresse">
          <p>12 rue des Lilas, 69001 Lyon</p>
          <CrButton size="s" onClick={next}>Continuer</CrButton>
        </CrAccordionItem>
        <CrAccordionItem label="Paiement">
          <p>Carte se terminant par 4242</p>
          <CrButton size="s" onClick={next}>Payer</CrButton>
        </CrAccordionItem>
      </CrAccordion>
      <p role="status">{complete ? 'Commande validée.' : ''}</p>
    </div>
  );
}
