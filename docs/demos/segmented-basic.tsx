'use client';

import { useState } from 'react';
import { CrBox, CrSegmented } from '@cristal/react';

const variants = ['thumb', 'clip', 'underline', 'outline'] as const;

export default function SegmentedBasic() {
  const [period, setPeriod] = useState('month');

  return (
    <CrBox display="flex" direction="column" gap="xl" align="center">
      {variants.map((variant) => (
        <CrSegmented key={variant} label={`Période, style ${variant}`} variant={variant} value={period} onCrChange={(event) => setPeriod(event.detail)}>
          <option value="day">Jour</option>
          <option value="week">Semaine</option>
          <option value="month">Mois</option>
          <option value="year">Année</option>
        </CrSegmented>
      ))}
      <p>Période choisie : {period}</p>
    </CrBox>
  );
}
