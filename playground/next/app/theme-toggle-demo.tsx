'use client';

import { useState } from 'react';
import { CrAvatar, CrSegmented, CrSwitch, CrThemeToggle } from '@cristal/react';

const transitions = ['circle', 'curtain', 'blinds', 'flip', 'eclipse', 'sweep', 'none'] as const;
const icons = [
  ['morph', 'Morphose'],
  ['rotate', 'Rotation'],
  ['rise', 'Horizon'],
  ['flip', 'Pièce'],
  ['eclipse', 'Éclipse'],
] as const;
const variants = ['icon', 'switch', 'label'] as const;
const card = {
  position: 'relative',
  display: 'grid',
  gap: 'var(--cr-spacing-lg)',
  width: '100%',
  maxWidth: 360,
  padding: 'var(--cr-spacing-xl)',
  boxSizing: 'border-box',
  background: 'var(--cr-color-surface)',
  border: '1px solid var(--cr-color-border)',
  borderRadius: 'var(--cr-radius-l)',
} as const;

export function ThemeToggleDemo() {
  const [index, setIndex] = useState(0);
  const [theme, setTheme] = useState('');
  const [icon, setIcon] = useState(0);

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', justifyItems: 'start' }}>
      <CrSegmented label="Transition" value={String(index)} onCrChange={(event) => setIndex(Number(event.detail))}>
        {transitions.map((transition, value) => (
          <option key={transition} value={value}>
            {transition}
          </option>
        ))}
      </CrSegmented>
      <section style={card} aria-label="Profil">
        <CrThemeToggle data-testid="theme-toggle" transition={transitions[index]} onCrChange={(event) => setTheme(event.detail)} style={{ position: 'absolute', top: 16, right: 16 }} />
        <div style={{ display: 'flex', gap: 'var(--cr-spacing-lg)', alignItems: 'center', paddingRight: 48 }}>
          <CrAvatar name="Léa Simon" size="l" />
          <div>
            <strong>Léa Simon</strong>
            <p style={{ margin: 0, color: 'var(--cr-color-text-muted)' }}>@lea.simon</p>
          </div>
        </div>
        <p style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--cr-spacing-lg)', margin: 0 }}>
          Apparence <span style={{ color: 'var(--cr-color-text-muted)' }}>{theme === 'dark' ? 'Sombre' : 'Clair'} ›</span>
        </p>
        <CrSwitch label="Notifications" checked />
      </section>
      <CrSegmented label="Animation de l'icône" value={String(icon)} onCrChange={(event) => setIcon(Number(event.detail))}>
        {icons.map(([value, label], position) => (
          <option key={value} value={position}>
            {label}
          </option>
        ))}
      </CrSegmented>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--cr-spacing-xl)', alignItems: 'center' }}>
        {variants.map((variant) => (
          <CrThemeToggle key={variant} data-testid={`theme-toggle-${variant}`} variant={variant} icon={icons[icon][0]} transition={transitions[index]} onCrChange={(event) => setTheme(event.detail)} />
        ))}
      </div>
      <p data-testid="theme-event">{theme}</p>
    </div>
  );
}
