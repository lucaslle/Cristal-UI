'use client';

import { useRef, useState } from 'react';
import { CrButton, CrStep, CrStepper } from '@cristal/react';

export default function StepperTimeline() {
  const steps = useRef<HTMLCrStepperElement>(null);
  const [complete, setComplete] = useState(false);
  const next = () => steps.current?.next();

  return (
    <div style={{ width: '100%' }}>
      <CrStepper ref={steps} variant="timeline" label="Commande" onCrComplete={() => setComplete(true)}>
        <CrStep label="Panier">
          <p>3 articles, 128,40 €</p>
          <CrButton size="s" onClick={next}>Continuer</CrButton>
        </CrStep>
        <CrStep label="Adresse">
          <p>12 rue des Lilas, 69001 Lyon</p>
          <CrButton size="s" onClick={next}>Continuer</CrButton>
        </CrStep>
        <CrStep label="Paiement">
          <p>Carte se terminant par 4242</p>
          <CrButton size="s" onClick={next}>Payer</CrButton>
        </CrStep>
      </CrStepper>
      <p role="status">{complete ? 'Commande validée.' : ''}</p>
    </div>
  );
}
