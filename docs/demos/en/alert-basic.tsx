'use client';

import { useState } from 'react';
import { CrAlert, CrBox, CrButton } from '@cristal/react';

export default function AlertBasic() {
  const [error, setError] = useState(0);

  return (
    <CrBox display="flex" direction="column" gap="sm">
      <CrAlert heading="New version">Version 2.4 adds PDF export.</CrAlert>
      <CrAlert variant="success">Changes saved.</CrAlert>
      <CrAlert variant="warning" heading="Low stock">
        3 items left in stock.
      </CrAlert>
      {error > 0 && (
        <CrAlert key={error} variant="danger" heading="Sending failed" dismissible onCrClose={() => setError(0)}>
          Check your connection and try again.
        </CrAlert>
      )}
      <CrButton variant="outline" onClick={() => setError((count) => count + 1)}>
        Send
      </CrButton>
    </CrBox>
  );
}
