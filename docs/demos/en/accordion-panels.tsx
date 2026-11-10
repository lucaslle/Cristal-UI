import { CrAccordion, CrAccordionItem } from '@cristal/react';

const trails = [
  { label: 'Peaks', from: '#4c1d95', to: '#f59e0b', text: '12 hikes' },
  { label: 'Coast', from: '#0e7490', to: '#a5f3fc', text: '8 hikes' },
  { label: 'Meadow', from: '#3f6212', to: '#bef264', text: '5 hikes' },
  { label: 'Forest', from: '#14532d', to: '#4ade80', text: '9 hikes' },
];

export default function AccordionPanels() {
  return (
    <CrAccordion variant="panels" style={{ width: '100%' }}>
      {trails.map((trail) => (
        <CrAccordionItem key={trail.label} label={trail.label}>
          <p style={{ margin: '0 0 8px' }}>{trail.text}</p>
          <div style={{ height: 150, borderRadius: 8, background: `linear-gradient(160deg, ${trail.from}, ${trail.to})` }} />
        </CrAccordionItem>
      ))}
    </CrAccordion>
  );
}
