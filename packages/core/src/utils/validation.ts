export type FieldKind = 'text' | 'email' | 'url' | 'number' | 'checkbox' | 'select' | 'select-multiple';

const missing: Partial<Record<FieldKind, string>> = {
  checkbox: 'Cochez cette case pour continuer.',
  select: 'Choisissez une option dans la liste.',
  'select-multiple': 'Choisissez au moins une option dans la liste.',
};

const mismatch: Partial<Record<FieldKind, string>> = {
  email: 'Saisissez une adresse e-mail valide, par exemple nom@domaine.fr.',
  url: 'Saisissez une adresse web valide, par exemple https://exemple.fr.',
};

export const validationMessage = (validity: ValidityState | undefined, kind: FieldKind): string => {
  if (!validity || validity.valid) return '';
  if (validity.valueMissing) return missingMessage(kind);
  if (validity.typeMismatch) return mismatch[kind] ?? 'Le format saisi est incorrect.';
  if (validity.badInput) return 'Saisissez un nombre.';
  return 'La valeur saisie est incorrecte.';
};

export const missingMessage = (kind: FieldKind) => missing[kind] ?? 'Ce champ est obligatoire.';

export const kindOf = (type: string): FieldKind =>
  type === 'email' || type === 'url' || type === 'number' ? type : 'text';

export const handleInvalid = (event: Event, host: HTMLElement, focusTarget?: HTMLElement) => {
  event.preventDefault();
  const form = host.closest('form');
  if (form?.querySelector(':invalid') === host) focusTarget?.focus();
};
