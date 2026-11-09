const SPACING = ['xs', 'sm', 'lg', 'xl', '2xl', '3xl'];
const RADIUS = ['m', 'l'];
const BACKGROUNDS: Record<string, string> = {
  surface: 'var(--cr-color-surface)',
  subtle: 'var(--cr-color-primary-subtle)',
  primary: 'var(--cr-color-primary)',
  muted: 'color-mix(in oklab, var(--cr-color-primary-subtle) 40%, var(--cr-color-surface))',
};

/** « lg » → var(--cr-spacing-lg) ; « sm xl » → deux valeurs ; tout autre texte CSS passe tel quel (« 12px », « 2rem »). */
export const spacing = (value?: string) => value?.split(/\s+/).map((part) => (SPACING.includes(part) ? `var(--cr-spacing-${part})` : part)).join(' ');

export const radius = (value?: string) => (value === 'full' ? '999px' : value && RADIUS.includes(value) ? `var(--cr-radius-${value})` : value);

export const background = (value?: string) => (value ? BACKGROUNDS[value] ?? value : undefined);

/** « 3 » → trois colonnes égales ; « 200px » → autant de colonnes d'au moins 200px que la place le permet. */
export const columns = (value?: string | number) => {
  if (value === undefined || value === '') return undefined;
  return /^\d+$/.test(String(value)) ? `repeat(${value}, minmax(0, 1fr))` : `repeat(auto-fill, minmax(min(${value}, 100%), 1fr))`;
};
