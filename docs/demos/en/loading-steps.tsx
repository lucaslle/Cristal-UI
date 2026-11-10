'use client';

import { useEffect, useState } from 'react';
import { CrBox, CrButton, CrProgressSteps } from '@cristal/react';

const steps = ['Searching', 'Reading', 'Writing'];

export default function LoadingSteps() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= steps.length) return;
    const timer = setTimeout(() => setCurrent(current + 1), 1000);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <CrBox display="flex" direction="column" gap="lg" align="start">
      <CrProgressSteps label="Preparing the answer" steps={steps} current={current} />
      <CrButton size="s" variant="secondary" disabled={current < steps.length} onClick={() => setCurrent(0)}>
        Restart
      </CrButton>
    </CrBox>
  );
}
