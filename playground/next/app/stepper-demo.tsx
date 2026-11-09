'use client';

import { useRef, useState } from 'react';
import { CrButton, CrStep, CrStepper } from '@cristal/react';

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--cr-spacing-xl)' };
const variants = [
  ['line', 'Bead Line'],
  ['number', 'Big Number'],
  ['path', 'Skill Path'],
  ['blocks', 'Level Blocks'],
  ['gauge', 'Gauge Arc'],
] as const;

export function StepperDemo() {
  const timeline = useRef<HTMLCrStepperElement>(null);
  const [complete, setComplete] = useState(false);
  const next = () => timeline.current?.next();

  return (
    <div style={grid}>
      {variants.map(([variant, title]) => (
        <section key={variant}>
          <h3>{title}</h3>
          <CrStepper variant={variant} label={`Inscription ${title}`} navigation>
            <CrStep label="Compte">Choisissez une adresse e-mail.</CrStep>
            <CrStep label="Profil">Ajoutez votre nom et une photo.</CrStep>
            <CrStep label="Offre">Choisissez votre formule.</CrStep>
            <CrStep label="Fin">Vérifiez puis validez.</CrStep>
          </CrStepper>
        </section>
      ))}
      <section>
        <h3>Commande</h3>
        <CrStepper ref={timeline} variant="timeline" label="Commande" onCrComplete={() => setComplete(true)}>
          <CrStep label="Panier">
            <p>3 articles</p>
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
        <p role="status">{complete ? 'Commande validée' : ''}</p>
      </section>
    </div>
  );
}
