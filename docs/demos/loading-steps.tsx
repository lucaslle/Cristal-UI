'use client';

import { useEffect, useState } from 'react';
import { CrBox, CrButton, CrProgressSteps } from '@cristal/react';

const steps = ['Recherche', 'Lecture', 'Rédaction'];

export default function LoadingSteps() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= steps.length) return;
    const timer = setTimeout(() => setCurrent(current + 1), 1000);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <CrBox display="flex" direction="column" gap="lg" align="start">
      <CrProgressSteps label="Réponse en préparation" steps={steps} current={current} />
      <CrButton size="s" variant="secondary" disabled={current < steps.length} onClick={() => setCurrent(0)}>
        Recommencer
      </CrButton>
    </CrBox>
  );
}
