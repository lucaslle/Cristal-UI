'use client';

import { useState } from 'react';
import { CrMenu } from '@cristal/react';

export default function MenuActions() {
  const [action, setAction] = useState('');

  return (
    <>
      <CrMenu label="Actions" animation="anchor-pop" onCrSelect={(event) => setAction(event.detail)}>
        <option value="edit">Modifier</option>
        <option value="duplicate">Dupliquer</option>
        <option value="archive" disabled>
          Archiver
        </option>
        <option value="delete">Supprimer</option>
      </CrMenu>
      <span role="status">{action && `Action choisie : ${action}`}</span>
    </>
  );
}
