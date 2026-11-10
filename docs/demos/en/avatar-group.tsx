'use client';

import { CrAvatar, CrAvatarGroup } from '@cristal/react';

const team = ['Mary Smith', 'Karim Ali', 'Lea Martin', 'Tom Little', 'Ines Moore', 'Hugo Brown'];

export default function AvatarGroup() {
  return (
    <CrAvatarGroup max={4}>
      {team.map((name) => (
        <CrAvatar key={name} name={name} />
      ))}
    </CrAvatarGroup>
  );
}
