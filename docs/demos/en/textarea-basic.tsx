import { CrButton, CrTextarea } from '@cristal/react';

export default function TextareaBasic() {
  return (
    <CrTextarea label="Note" name="note" placeholder="Write a note…" maxRows={6} style={{ width: '100%', maxWidth: 420 }}>
      <CrButton slot="end" size="xs" aria-label="Send note">
        ↑
      </CrButton>
    </CrTextarea>
  );
}
