'use client';

import { useState } from 'react';
import { CrBox, CrFileUpload } from '@cristal/react';

export default function FileUploadBasic() {
  const [count, setCount] = useState(0);

  return (
    <CrBox display="flex" direction="column" gap="lg" style={{ width: '100%', maxWidth: 420 }}>
      <CrFileUpload
        label="Justificatifs"
        hint="PDF ou image, plusieurs fichiers possibles."
        name="justificatifs"
        accept=".pdf,image/*"
        multiple
        onCrChange={(event) => setCount(event.detail.length)}
      />
      <CrFileUpload label="Photo de profil (verrouillée)" disabled />
      <p>{count > 1 ? `${count} fichiers choisis` : `${count} fichier choisi`}</p>
    </CrBox>
  );
}
