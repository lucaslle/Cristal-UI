'use client';

import { CrAvatar, CrAvatarGroup } from '@cristal/react';

const photo = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23d6c8f5"/%3E%3Ccircle cx="20" cy="16" r="7" fill="%234c1d95"/%3E%3Cpath d="M7 40c1-9 7-13 13-13s12 4 13 13z" fill="%234c1d95"/%3E%3C/svg%3E';
const team = ['Marie Dupont', 'Karim Benali', 'Léa Martin', 'Tom Petit', 'Inès Moreau'];

export function AvatarDemo() {
  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', justifyItems: 'start' }}>
      <div data-testid="avatars" style={{ display: 'flex', gap: 'var(--cr-spacing-lg)', alignItems: 'center' }}>
        <CrAvatar name="Marie Dupont" status="online" />
        <CrAvatar name="Karim Benali" status="away" size="l" src={photo} />
        <CrAvatar name="Léa Martin" status="busy" size="s" />
        <CrAvatar name="Tom Petit" status="offline" />
      </div>
      <CrAvatarGroup data-testid="avatar-group" max={3}>
        {team.map((name) => (
          <CrAvatar key={name} name={name} />
        ))}
      </CrAvatarGroup>
    </div>
  );
}
