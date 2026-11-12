'use client';

import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { CrButton, CrCheckbox, CrInput, CrOtp } from '@cristal/react';

const variants = ['zigzag', 'pop', 'drop', 'echo', 'jitter', 'wobble', 'none'] as const;

function Form({ id, children }: { id: string; children: ReactNode }) {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };
  return (
    <form data-testid={`error-${id}`} onSubmit={submit} onInput={() => setSent(false)} style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', alignContent: 'start' }}>
      {children}
      <CrButton type="submit">Continuer</CrButton>
      <p role="status" style={{ margin: 0 }}>
        {sent && 'Envoyé.'}
      </p>
    </form>
  );
}

export function FieldErrorDemo() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--cr-spacing-xl)' }}>
      {variants.map((variant) => (
        <Form key={variant} id={variant}>
          <CrInput label={`Courriel (${variant})`} type="email" name="email" autocomplete="email" required errorAnimation={variant} />
        </Form>
      ))}
      <Form id="checkbox">
        <CrCheckbox label="Je confirme mon inscription" name="confirm" required errorAnimation="pop" />
      </Form>
      <Form id="otp">
        <CrOtp label="Code de vérification" name="code" length={4} required errorAnimation="echo" />
      </Form>
    </div>
  );
}
