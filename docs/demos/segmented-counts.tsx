import { CrSegmented } from '@cristal/react';

export default function SegmentedCounts() {
  return (
    <CrSegmented label="Tâches terminées" value="month">
      <option value="day" data-count="4">Jour</option>
      <option value="week" data-count="12">Semaine</option>
      <option value="month" data-count="38">Mois</option>
      <option value="year" data-count="96">Année</option>
    </CrSegmented>
  );
}
