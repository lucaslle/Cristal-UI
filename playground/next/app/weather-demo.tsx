import type { CSSProperties } from 'react';
import { CrBackground, CrWeather } from '@cristal/react/ssr';

const conditions = [
  ['clear', 'Dégagé'],
  ['rain', 'Pluie fine'],
  ['storm', 'Forte pluie'],
  ['fog', 'Brouillard'],
  ['frost', 'Givre'],
  ['heat', 'Chaleur'],
  ['wind', 'Vent'],
] as const;

// Un fond vif derrière les cartes, comme une photo floutée : c'est le cas le plus dur pour la lisibilité du verre.
const backdrop = {
  '--cr-background-base': '#6d28d9',
  '--cr-background-color-1': '#fb923c',
  '--cr-background-color-2': '#ec4899',
  '--cr-background-color-3': '#22d3ee',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: 'var(--cr-spacing-lg)',
  padding: 'var(--cr-spacing-xl) var(--cr-spacing-xl) var(--cr-spacing-3xl)',
  borderRadius: 'var(--cr-radius-l)',
} as CSSProperties;

const card = { padding: 'var(--cr-spacing-lg) var(--cr-spacing-xl) var(--cr-spacing-3xl)' };

export function WeatherDemo() {
  return (
    <CrBackground variant="aurora" style={backdrop}>
      {conditions.map(([condition, label]) => (
        <CrWeather key={condition} data-testid={`weather-${condition}`} condition={condition} style={card}>
          <h3 style={{ margin: 0 }}>Lyon</h3>
          <p style={{ margin: 0 }}>Jeudi 12 novembre</p>
          <p style={{ margin: 'var(--cr-spacing-sm) 0 0', fontSize: 48, lineHeight: 1 }}>14°</p>
          <p style={{ margin: '0 0 var(--cr-spacing-sm)' }}>{label}</p>
          <p style={{ margin: 0 }}>Humidité 82 %, vent 12 km/h</p>
          <a href="#meteo" style={{ color: 'inherit' }}>
            Prévisions à 7 jours
          </a>
        </CrWeather>
      ))}
      <CrWeather data-testid="weather-no-controls" condition="frost" controls={false} style={card}>
        <h3 style={{ margin: 0 }}>Sans bouton pause</h3>
        <p>L’application fournit sa propre commande pour arrêter les animations.</p>
      </CrWeather>
    </CrBackground>
  );
}
