'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrConfirm } from '@cristal/react';

export default function ConfirmBasic() {
  const [files, setFiles] = useState(['rapport-mars.pdf', 'devis-client.docx', 'photo-equipe.jpg']);

  return (
    <CrBox display="flex" direction="column" gap="sm" align="start">
      {files.map((file) => (
        <CrBox key={file} display="flex" gap="lg" align="center">
          <span style={{ minWidth: 160 }}>{file}</span>
          <CrConfirm question={`Supprimer ${file} ?`} confirmLabel="Supprimer" onCrConfirm={() => setFiles((all) => all.filter((name) => name !== file))}>
            <CrButton size="s" variant="outline">
              Supprimer
            </CrButton>
          </CrConfirm>
        </CrBox>
      ))}
      <span role="status">{files.length === 0 ? 'Tous les fichiers ont été supprimés.' : ''}</span>
    </CrBox>
  );
}
