import type { Messages } from './i18n';
import { replayError } from './field-error';

export type FieldKind = 'text' | 'email' | 'url' | 'number' | 'checkbox' | 'select' | 'select-multiple';

export const validationMessage = (validity: ValidityState | undefined, kind: FieldKind, m: Messages): string => {
  if (!validity || validity.valid) return '';
  if (validity.valueMissing) return missingMessage(kind, m);
  if (validity.typeMismatch) return kind === 'email' ? m.email : kind === 'url' ? m.url : m.format;
  if (validity.badInput) return m.number;
  return m.invalid;
};

export const missingMessage = (kind: FieldKind, m: Messages) =>
  kind === 'checkbox' ? m.checkbox : kind === 'select' ? m.select : kind === 'select-multiple' ? m.selectMultiple : m.required;

export const kindOf = (type: string): FieldKind =>
  type === 'email' || type === 'url' || type === 'number' ? type : 'text';

export const handleInvalid = (event: Event, host: HTMLElement, focusTarget?: HTMLElement) => {
  event.preventDefault();
  replayError(host);
  const form = host.closest('form');
  if (form?.querySelector(':invalid') === host) focusTarget?.focus();
};
