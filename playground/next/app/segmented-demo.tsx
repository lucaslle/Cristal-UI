'use client';

import { useState } from 'react';
import { CrSegmented } from '@cristal/react';

const column = { display: 'grid', gap: 'var(--cr-spacing-lg)', justifyItems: 'start' };

export function SegmentedDemo() {
  const [period, setPeriod] = useState('month');

  return (
    <div style={column}>
      <form data-testid="segmented-form">
        <CrSegmented label="Période" name="period" value={period} onCrChange={(event) => setPeriod(event.detail)}>
          <option value="day">Jour</option>
          <option value="week">Semaine</option>
          <option value="month">Mois</option>
          <option value="year">Année</option>
        </CrSegmented>
      </form>
      <p data-testid="segmented-value">{period}</p>
      <CrSegmented label="Période clip" variant="clip">
        <option value="day">Jour</option>
        <option value="week">Semaine</option>
      </CrSegmented>
      <CrSegmented label="Période underline" variant="underline">
        <option value="day">Jour</option>
        <option value="week">Semaine</option>
      </CrSegmented>
      <CrSegmented label="Période outline" variant="outline">
        <option value="day">Jour</option>
        <option value="week">Semaine</option>
      </CrSegmented>
      <CrSegmented label="Tâches" fit>
        <option value="day" data-count="4">Jour</option>
        <option value="month" data-count="38">Mois</option>
        <option value="archived" disabled>Archivées</option>
      </CrSegmented>
    </div>
  );
}
