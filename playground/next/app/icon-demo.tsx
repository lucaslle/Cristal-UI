'use client';

import { createElement, useEffect, type CSSProperties } from 'react';
import { defineIcons } from '@cristal-ui/core/dist/components';
import { CrIconHeart, CrIconSearch, CrIconStar } from '@cristal-ui/react';

export function IconDemo() {
  useEffect(() => defineIcons('bell', 'trash'), []);
  return (
    <div data-testid="icons" style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'rgb(30, 27, 46)' }}>
      <CrIconSearch data-testid="icon-default" />
      <CrIconHeart size={32} color="rgb(225, 29, 72)" label="Favori" />
      <span style={{ '--cr-icon-size': '40px', color: 'rgb(5, 150, 105)' } as CSSProperties}>
        <CrIconStar data-testid="icon-variable" />
      </span>
      {createElement('cr-icon-bell', { size: '20', label: 'Notifications' })}
      {createElement('cr-icon-trash', { color: 'rgb(220, 38, 38)', 'data-testid': 'icon-element' })}
    </div>
  );
}
