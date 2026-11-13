'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrConfirm } from '@cristal/react';

export default function ConfirmBasic() {
  const [files, setFiles] = useState(['march-report.pdf', 'client-quote.docx', 'team-photo.jpg']);

  return (
    <CrBox display="flex" direction="column" gap="sm" align="start">
      {files.map((file) => (
        <CrBox key={file} display="flex" gap="lg" align="center">
          <span style={{ minWidth: 160 }}>{file}</span>
          <CrConfirm question={`Delete ${file}?`} confirmLabel="Delete" onCrConfirm={() => setFiles((all) => all.filter((name) => name !== file))}>
            <CrButton size="s" variant="outline">
              Delete
            </CrButton>
          </CrConfirm>
        </CrBox>
      ))}
      <span role="status">{files.length === 0 ? 'All files have been deleted.' : ''}</span>
    </CrBox>
  );
}
