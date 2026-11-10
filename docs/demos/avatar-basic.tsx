'use client';

import { CrAvatar, CrBox } from '@cristal/react';

const photo = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#d6c8f5"/><circle cx="20" cy="16" r="7" fill="#4c1d95"/><path d="M7 40c1-9 7-13 13-13s12 4 13 13z" fill="#4c1d95"/></svg>',
)}`;

export default function AvatarBasic() {
  return (
    <CrBox display="flex" gap="lg" align="center" wrap>
      <CrAvatar name="Marie Dupont" status="online" />
      <CrAvatar name="Karim Benali" src={photo} status="away" />
      <CrAvatar name="Léa Martin" status="busy" size="l" />
      <CrAvatar name="Tom Petit" status="offline" size="s" />
    </CrBox>
  );
}
