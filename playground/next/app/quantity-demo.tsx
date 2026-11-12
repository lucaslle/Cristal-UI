'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { CrButton, CrQuantity } from '@cristal/react';

const animations = ['press', 'slide', 'ripple', 'stretch', 'spin', 'halo'] as const;

const card = { display: 'grid', gap: 'var(--cr-spacing-sm)', padding: 'var(--cr-spacing-lg)', border: '1px solid var(--cr-color-border)', borderRadius: 'var(--cr-radius-l)' };

export function QuantityDemo() {
  const [values, setValues] = useState<Record<string, number | undefined>>({});
  const [events, setEvents] = useState<Record<string, string>>({});
  const [sent, setSent] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(`Envoyé : ${new FormData(event.currentTarget).get('mugs')} mugs.`);
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-xl)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--cr-spacing-lg)' }}>
        {animations.map((animation) => (
          <div key={animation} data-testid={`quantity-${animation}`} style={card}>
            <CrQuantity
              label={`Quantité (${animation})`}
              animation={animation}
              value={animation in values ? values[animation] : 2}
              max={5}
              onCrInput={(event) => {
                setValues((current) => ({ ...current, [animation]: event.detail }));
                setEvents((current) => ({ ...current, [animation]: `input ${event.detail}` }));
              }}
              onCrChange={(event) => setEvents((current) => ({ ...current, [`${animation}-change`]: `change ${event.detail}` }))}
            />
            <p style={{ margin: 0, color: 'var(--cr-color-text-muted)' }}>
              {[events[animation], events[`${animation}-change`]].filter(Boolean).join(' · ') || '—'}
            </p>
          </div>
        ))}
      </div>
      <form data-testid="quantity-form" onSubmit={submit} onInput={() => setSent('')} style={{ ...card, justifyItems: 'start' }}>
        <CrQuantity label="Mugs" name="mugs" hint="Par lot de 2, de 2 à 10." min={2} max={10} step={2} required errorAnimation="wobble" />
        <div style={{ display: 'flex', gap: 'var(--cr-spacing-sm)' }}>
          <CrButton type="submit">Ajouter au panier</CrButton>
          <CrButton type="reset" variant="secondary">
            Revenir à 2 mugs
          </CrButton>
        </div>
        <p role="status" style={{ margin: 0 }}>
          {sent}
        </p>
      </form>
    </div>
  );
}
