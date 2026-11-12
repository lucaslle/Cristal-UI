import { CrBackground, CrButton } from '@cristal/react/ssr';

const variants = [
  ['aurora', 'Aurore', 'Des halos de couleur qui dérivent lentement.'],
  ['gradient', 'Dégradé', 'Un dégradé qui glisse d’un bout à l’autre.'],
  ['grid', 'Grille', 'Un sol quadrillé qui avance vers l’horizon.'],
  ['dots', 'Points', 'Une vague qui traverse une grille de points.'],
  ['waves', 'Vagues', 'Trois vagues superposées qui ondulent.'],
  ['particles', 'Particules', 'Des points reliés à leurs voisins proches.'],
] as const;

const block = { padding: 'var(--cr-spacing-2xl) var(--cr-spacing-xl) var(--cr-spacing-3xl)', borderRadius: 'var(--cr-radius-l)', minHeight: 200 };

export function BackgroundDemo() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--cr-spacing-lg)' }}>
      {variants.map(([variant, title, text]) => (
        <CrBackground key={variant} data-testid={`background-${variant}`} variant={variant} style={block}>
          <h3 style={{ marginTop: 0 }}>{title}</h3>
          <p>{text}</p>
          <CrButton size="s">Découvrir {title.toLowerCase()}</CrButton>
        </CrBackground>
      ))}
      <CrBackground data-testid="background-still-particles" variant="particles" interactive={false} style={block}>
        <h3 style={{ marginTop: 0 }}>Particules sans pointeur</h3>
        <p>Les points ignorent le curseur.</p>
      </CrBackground>
      <CrBackground data-testid="background-no-controls" variant="aurora" controls={false} style={block}>
        <h3 style={{ marginTop: 0 }}>Sans bouton pause</h3>
        <p>L’application fournit sa propre commande pour arrêter les animations.</p>
      </CrBackground>
    </div>
  );
}
