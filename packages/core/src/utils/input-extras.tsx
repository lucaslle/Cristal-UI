import { h } from '@stencil/core';
import type { Messages } from './i18n';

/** Note de 0 à 4 : longueur, majuscules et minuscules, chiffres, symboles. */
export const passwordScore = (password: string) => {
  if (!password) return 0;
  const points = [password.length >= 8, password.length >= 12, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  return Math.min(4, password.length < 6 ? Math.min(points, 1) : points);
};

/** Jauge en 4 segments qui se remplissent et changent de couleur, avec le niveau écrit. */
export const StrengthMeter = ({ id, password, m }: { id: string; password: string; m: Messages }) => {
  const score = passwordScore(password);
  return (
    <div class={`strength level-${score}`}>
      <div class="segments" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span class={{ segment: true, on: !!password && step <= Math.max(score, 1) }} />
        ))}
      </div>
      <span id={id} class="strength-text" aria-live="polite">
        {password ? m.strength(score) : ''}
      </span>
    </div>
  );
};

/** Première suggestion qui prolonge la saisie (sans tenir compte des majuscules). */
export const completionFor = (value: string, completions: string[] = []) =>
  value ? completions.find((item) => item.length > value.length && item.toLowerCase().startsWith(value.toLowerCase())) : undefined;

/** Texte grisé affiché derrière la saisie : la partie déjà tapée est invisible, la suite est en gris. */
export const Ghost = ({ value, completion, onAccept }: { value: string; completion?: string; onAccept: () => void }) =>
  completion && (
    <span class="ghost" aria-hidden="true" onPointerDown={(event: PointerEvent) => (event.preventDefault(), onAccept())}>
      <span class="typed">{value}</span>
      <span class="rest">{completion.slice(value.length)}</span>
    </span>
  );
