'use client';

import { CrBox, CrCodeBlock } from '@cristal/react';

const config = `{
  "name": "my-app",
  "dependencies": {
    "@cristal/react": "^1.0.0"
  }
}`;

export default function CodeBlockBasic() {
  return (
    <CrBox display="flex" direction="column" gap="lg">
      <CrCodeBlock label="Terminal" code="pnpm add @cristal/react" />
      <CrCodeBlock label="package.json" code={config} />
    </CrBox>
  );
}
