'use client';

import { useState } from 'react';
import { CrBadge, CrBox, CrButton } from '@cristal/react';

export default function BadgeBasic() {
  const [unread, setUnread] = useState(3);

  return (
    <CrBox display="flex" direction="column" gap="lg" align="start">
      <CrBox display="flex" gap="sm" align="center" wrap>
        <CrBadge>Draft</CrBadge>
        <CrBadge variant="primary">New</CrBadge>
        <CrBadge variant="success">Paid</CrBadge>
        <CrBadge variant="danger">Overdue</CrBadge>
      </CrBox>
      <CrBox display="flex" gap="sm" align="center" wrap>
        <CrBadge variant="primary" count={unread} live>
          Unread
        </CrBadge>
        <CrButton size="s" variant="secondary" onClick={() => setUnread((count) => count + 4)}>
          Receive messages
        </CrButton>
        <CrButton size="s" variant="outline" onClick={() => setUnread(0)}>
          Mark all as read
        </CrButton>
      </CrBox>
    </CrBox>
  );
}
