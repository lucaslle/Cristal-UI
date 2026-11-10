'use client';

import { useState } from 'react';
import { CrMenu } from '@cristal/react';

export default function MenuActions() {
  const [action, setAction] = useState('');

  return (
    <>
      <CrMenu label="Actions" animation="anchor-pop" onCrSelect={(event) => setAction(event.detail)}>
        <option value="edit">Edit</option>
        <option value="duplicate">Duplicate</option>
        <option value="archive" disabled>
          Archive
        </option>
        <option value="delete">Delete</option>
      </CrMenu>
      <span role="status">{action && `Selected action: ${action}`}</span>
    </>
  );
}
