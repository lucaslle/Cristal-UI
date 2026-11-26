import { CrButton, CrCard } from '@cristal-ui/react';

export default function CardBasic() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--cr-spacing-lg)', width: '100%' }}>
      <CrCard>
        <h3 slot="header">Clavier mécanique</h3>
        <p>Switches silencieux, rétroéclairage blanc.</p>
        <CrButton slot="footer" size="s" variant="outline">
          Voir le produit
        </CrButton>
      </CrCard>
      <CrCard>
        <p>Une carte peut ne contenir que du contenu, sans en-tête ni pied.</p>
      </CrCard>
    </div>
  );
}
