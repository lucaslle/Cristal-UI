'use client';

import { useState } from 'react';
import { CrBox, CrSegmented } from '@cristal/react';

const variants = ['thumb', 'clip', 'underline', 'outline'] as const;

export default function SegmentedBasic() {
  const [period, setPeriod] = useState('month');

  return (
    <CrBox display="flex" direction="column" gap="xl" align="center">
      {variants.map((variant) => (
        <CrSegmented key={variant} label={`Period, ${variant} style`} variant={variant} value={period} onCrChange={(event) => setPeriod(event.detail)}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </CrSegmented>
      ))}
      <p>Chosen period: {period}</p>
    </CrBox>
  );
}
