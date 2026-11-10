'use client';

import { useState } from 'react';
import { CrOtp } from '@cristal/react';

export default function OtpBasic() {
  const [code, setCode] = useState('');

  return (
    <>
      <CrOtp label="Code sent by text message" name="code" hint="6 digits" onCrComplete={(event) => setCode(event.detail)} />
      <p role="status">{code && `Full code: ${code}`}</p>
    </>
  );
}
