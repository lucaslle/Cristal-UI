import { h } from '@stencil/core';

export type ErrorAnimation = 'none' | 'zigzag' | 'pop' | 'drop' | 'echo' | 'jitter' | 'wobble';

export interface FieldTextProps {
  id: string;
  hint?: string;
  error?: string;
  animation?: ErrorAnimation;
}

export const describedBy = ({ id, hint, error }: FieldTextProps) =>
  [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

export const FieldText = ({ id, hint, error, animation }: FieldTextProps) => [
  hint && (
    <span class="hint" id={`${id}-hint`} part="hint">
      {hint}
    </span>
  ),
  error && (
    <span class="error" id={`${id}-error`} part="error">
      {animation === 'jitter' ? <ErrorLetters error={error} /> : error}
    </span>
  ),
];

// jitter : le texte lu reste une seule chaîne ; les lettres qui sautent sont une copie masquée aux lecteurs d'écran.
const ErrorLetters = ({ error }: { error: string }) => [
  <span class="error-text">{error}</span>,
  <span aria-hidden="true">
    {Array.from(error, (letter, i) => (
      <span class="letter" style={{ '--i': `${i}` }}>
        {letter}
      </span>
    ))}
  </span>,
];

export const RequiredMark = ({ required }: { required: boolean }) =>
  required && (
    <span class="required" aria-hidden="true">
      {' *'}
    </span>
  );

interface FieldHeaderProps extends FieldTextProps {
  label: string;
  required: boolean;
  labelId?: string;
}

export const FieldHeader = ({ id, label, required, labelId, hint, error, animation }: FieldHeaderProps) => [
  <label class="label" id={labelId} htmlFor={id} part="label">
    {label}
    <RequiredMark required={required} />
  </label>,
  <FieldText id={id} hint={hint} error={error} animation={animation} />,
];
