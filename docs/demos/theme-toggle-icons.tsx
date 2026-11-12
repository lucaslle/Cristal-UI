'use client';

import { useState } from 'react';
import { CrBox, CrSegmented, CrThemeToggle } from '@cristal/react';

const icons = [
  ['morph', 'Morphose'],
  ['rotate', 'Rotation'],
  ['rise', 'Horizon'],
  ['flip', 'Pièce'],
  ['eclipse', 'Éclipse'],
] as const;

export default function ThemeToggleIcons() {
  const [index, setIndex] = useState(0);
  const icon = icons[index][0];

  return (
    <CrBox display="flex" direction="column" gap="xl" align="center">
      <CrSegmented label="Animation de l'icône" value={String(index)} onCrChange={(event) => setIndex(Number(event.detail))}>
        {icons.map(([value, label], position) => (
          <option key={value} value={position}>
            {label}
          </option>
        ))}
      </CrSegmented>
      <CrBox display="flex" gap="xl" align="center" justify="center" wrap>
        <CrThemeToggle variant="icon" icon={icon} />
        <CrThemeToggle variant="switch" icon={icon} />
        <CrThemeToggle variant="label" icon={icon} />
      </CrBox>
    </CrBox>
  );
}
