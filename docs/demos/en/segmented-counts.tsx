import { CrSegmented } from '@cristal/react';

export default function SegmentedCounts() {
  return (
    <CrSegmented label="Completed tasks" value="month">
      <option value="day" data-count="4">Day</option>
      <option value="week" data-count="12">Week</option>
      <option value="month" data-count="38">Month</option>
      <option value="year" data-count="96">Year</option>
    </CrSegmented>
  );
}
