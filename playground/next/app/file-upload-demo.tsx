'use client';

import { useState } from 'react';
import { CrFileUpload } from '@cristal/react';

export function FileUploadDemo() {
  const [names, setNames] = useState<string[]>([]);

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', maxWidth: 420 }}>
      <form data-testid="upload-form">
        <CrFileUpload
          label="Justificatifs"
          hint="PDF ou image, plusieurs fichiers possibles."
          name="justificatifs"
          accept=".pdf,image/*"
          multiple
          onCrChange={(event) => setNames(event.detail.map((file) => file.name))}
        />
      </form>
      <p data-testid="upload-names">{names.join(', ') || 'Aucun fichier'}</p>
      <CrFileUpload label="Photo de profil (verrouillée)" disabled />
    </div>
  );
}
