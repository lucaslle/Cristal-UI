'use client';

import { useState } from 'react';
import { CrButton, CrSparkline } from '@cristal/react';

const WEEKS = [
  [12, 18, 15, 30, 26, 41],
  [40, 32, 35, 22, 20, 9, 14],
];

export function SparklineDemo() {
  const [week, setWeek] = useState(0);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--cr-spacing-lg)', alignItems: 'center' }}>
      <span>
        Ventes <CrSparkline data-testid="sparkline-sales" label="Ventes de la semaine" values={WEEKS[week]} />
      </span>
      <CrSparkline data-testid="sparkline-visits" label="Visites" variant="area" values={[3, 3, 3]} style={{ width: 160, height: 40 }} />
      <CrButton size="s" variant="secondary" onClick={() => setWeek((current) => 1 - current)}>
        Changer de semaine
      </CrButton>
    </div>
  );
}
