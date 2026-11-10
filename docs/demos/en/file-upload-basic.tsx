'use client';

import { useState } from 'react';
import { CrBox, CrFileUpload } from '@cristal/react';

export default function FileUploadBasic() {
  const [count, setCount] = useState(0);

  return (
    <CrBox display="flex" direction="column" gap="lg" style={{ width: '100%', maxWidth: 420 }}>
      <CrFileUpload
        label="Receipts"
        hint="PDF or image, several files allowed."
        name="receipts"
        accept=".pdf,image/*"
        multiple
        onCrChange={(event) => setCount(event.detail.length)}
      />
      <CrFileUpload label="Profile picture (locked)" disabled />
      <p>{count === 1 ? '1 file chosen' : `${count} files chosen`}</p>
    </CrBox>
  );
}
