'use client';

import { CrAvatar, CrAvatarGroup } from '@cristal/react';

const team = ['Marie Dupont', 'Karim Benali', 'Léa Martin', 'Tom Petit', 'Inès Moreau', 'Hugo Bernard'];

export default function AvatarGroup() {
  return (
    <CrAvatarGroup max={4}>
      {team.map((name) => (
        <CrAvatar key={name} name={name} />
      ))}
    </CrAvatarGroup>
  );
}
