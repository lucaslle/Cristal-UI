import { h } from '@stencil/core';

export interface FieldTextProps {
  id: string;
  hint?: string;
  error?: string;
}

export const describedBy = ({ id, hint, error }: FieldTextProps) =>
  [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

export const FieldText = ({ id, hint, error }: FieldTextProps) => [
  hint && (
    <span class="hint" id={`${id}-hint`} part="hint">
      {hint}
    </span>
  ),
  error && (
    <span class="error" id={`${id}-error`} part="error">
      {error}
    </span>
  ),
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

export const FieldHeader = ({ id, label, required, labelId, hint, error }: FieldHeaderProps) => [
  <label class="label" id={labelId} htmlFor={id} part="label">
    {label}
    <RequiredMark required={required} />
  </label>,
  <FieldText id={id} hint={hint} error={error} />,
];
