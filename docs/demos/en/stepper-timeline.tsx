'use client';

import { useRef, useState } from 'react';
import { CrButton, CrStep, CrStepper } from '@cristal/react';

export default function StepperTimeline() {
  const steps = useRef<HTMLCrStepperElement>(null);
  const [complete, setComplete] = useState(false);
  const next = () => steps.current?.next();

  return (
    <div style={{ width: '100%' }}>
      <CrStepper ref={steps} variant="timeline" label="Order" onCrComplete={() => setComplete(true)}>
        <CrStep label="Cart">
          <p>3 items, $128.40</p>
          <CrButton size="s" onClick={next}>Continue</CrButton>
        </CrStep>
        <CrStep label="Address">
          <p>12 Lilac Lane, Austin, TX 78701</p>
          <CrButton size="s" onClick={next}>Continue</CrButton>
        </CrStep>
        <CrStep label="Payment">
          <p>Card ending in 4242</p>
          <CrButton size="s" onClick={next}>Pay</CrButton>
        </CrStep>
      </CrStepper>
      <p role="status">{complete ? 'Order confirmed.' : ''}</p>
    </div>
  );
}
