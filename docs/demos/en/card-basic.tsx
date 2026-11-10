import { CrButton, CrCard } from '@cristal/react';

export default function CardBasic() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--cr-spacing-lg)', width: '100%' }}>
      <CrCard>
        <h3 slot="header">Mechanical keyboard</h3>
        <p>Silent switches, white backlight.</p>
        <CrButton slot="footer" size="s" variant="outline">
          View product
        </CrButton>
      </CrCard>
      <CrCard>
        <p>A card can hold content only, with no header or footer.</p>
      </CrCard>
    </div>
  );
}
