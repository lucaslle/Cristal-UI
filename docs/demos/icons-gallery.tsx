'use client';

import type { ComponentType } from 'react';
import * as cristal from '@cristal-ui/react';
import type { CrIconProps } from '@cristal-ui/react';

const icons = Object.entries(cristal).filter(([name]) => name.startsWith('CrIcon') && name !== 'CrIconButton') as [string, ComponentType<CrIconProps>][];
const tag = (name: string) => `cr-icon${name.slice('CrIcon'.length).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;

export default function IconsGallery() {
  return (
    <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))', gap: 8, width: '100%', margin: 0, padding: 0, listStyle: 'none' }}>
      {icons.map(([name, Icon]) => (
        <li key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', textAlign: 'center' }}>
          <Icon />
          <code style={{ fontSize: 12 }}>{name}</code>
          <code style={{ fontSize: 11, opacity: 0.7 }}>{tag(name)}</code>
        </li>
      ))}
    </ul>
  );
}
