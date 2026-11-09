'use client';

import { useState } from 'react';
import { CrOtp } from '@cristal/react';

export default function OtpBasic() {
  const [code, setCode] = useState('');

  return (
    <>
      <CrOtp label="Code reçu par SMS" name="code" hint="6 chiffres" onCrComplete={(event) => setCode(event.detail)} />
      <p role="status">{code && `Code complet : ${code}`}</p>
    </>
  );
}
