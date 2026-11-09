import { CrAccordion, CrAccordionItem } from '@cristal/react';

const lines = [
  { label: 'Abonnement', amount: '99', text: '99,00 €' },
  { label: 'Options', amount: '19.9', text: '19,90 €' },
  { label: 'TVA', amount: '9.5', text: '9,50 €' },
];
const views = [30, 45, 40, 60, 55, 75, 90];

export default function AccordionCascade() {
  return (
    <CrAccordion animation="cascade" multiple style={{ width: '100%' }}>
      <CrAccordionItem label="Total">
        <span slot="meta">128,40 €</span>
        {lines.map((line) => (
          <div key={line.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>{line.label}</span>
            <span data-cr-count={line.amount}>{line.text}</span>
          </div>
        ))}
      </CrAccordionItem>
      <CrAccordionItem label="Vues cette semaine">
        <span slot="meta">4 200 (+12 %)</span>
        <div role="img" aria-label="Vues par jour : de 300 le lundi à 900 le dimanche" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
          {views.map((value, day) => (
            <div key={day} data-cr-grow="" style={{ flex: 1, height: `${value}%`, borderRadius: 4, background: 'var(--cr-color-primary)' }} />
          ))}
        </div>
      </CrAccordionItem>
    </CrAccordion>
  );
}
