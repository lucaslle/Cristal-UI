import { h } from '@stencil/core';
import type { NumberPart, NumberTrend } from './number-format';

export type NumberAnimation = 'roll' | 'flap' | 'blur' | 'stagger' | 'decode' | 'count';

/** Changement en cours : chiffres d'avant par rang, sens, et numéro qui relance les animations CSS. */
export type NumberChange = { before: Map<string, string>; trend: NumberTrend; run: number };

const REEL = [...'0123456789'];

/** Compteur kilométrique : une colonne 0-9 glisse dans une fenêtre d'un chiffre ; la transition CSS passe par les chiffres intermédiaires. */
const roll = (part: NumberPart, before: string) => (
  <span key={part.key} class="cell roll">
    <span class="sizer">{part.char}</span>
    <span class={{ reel: true, enter: !before }} style={{ '--digit': part.char }}>
      {REEL.map((digit) => (
        <span>{digit}</span>
      ))}
    </span>
  </span>
);

/** Tableau d'aéroport : la moitié haute de l'ancien chiffre se rabat, puis la moitié basse du nouveau descend. */
const flap = (part: NumberPart, before: string, run: number) =>
  before === part.char ? (
    <span key={part.key} class="cell tile">
      {part.char}
    </span>
  ) : (
    <span key={`${part.key}-${run}`} class="cell tile flip">
      <span class="sizer">{part.char}</span>
      <span class="half top">
        <span>{part.char}</span>
      </span>
      <span class="half bottom">
        <span>{before}</span>
      </span>
      <span class="half top fold">
        <span>{before}</span>
      </span>
      <span class="half bottom unfold">
        <span>{part.char}</span>
      </span>
    </span>
  );

/** Échange : l'ancien chiffre sort, le nouveau entre par le côté opposé (style --order : rang parmi les chiffres qui changent). */
const swap = (part: NumberPart, before: string, run: number, order: number) => (
  <span key={`${part.key}-${run}`} class="cell swap" style={{ '--order': String(order) }}>
    <span class="in">{part.char}</span>
    {before && <span class="out">{before}</span>}
  </span>
);

const plain = (part: NumberPart, scrambled?: string) => (
  <span key={part.key} class={{ cell: true, scrambled: scrambled !== undefined }}>
    {scrambled ?? part.char}
  </span>
);

/** Les caractères affichés : séparateurs fixes, chiffres animés selon animation. */
export const renderParts = (animation: NumberAnimation, parts: NumberPart[], change?: NumberChange, scrambled?: string[]) => {
  let order = 0;
  return parts.map((part, index) => {
    if (!part.digit) {
      return (
        <span key={part.key} class="sep">
          {part.char}
        </span>
      );
    }
    // Un rang qui vient d'apparaître (999 → 1 000) part d'une case vide.
    const before = change ? (change.before.get(part.key) ?? '') : part.char;
    if (animation === 'roll') return roll(part, before);
    if (animation === 'flap') return flap(part, before, change?.run ?? 0);
    // blur fait glisser tout le nombre, stagger seulement les chiffres qui changent.
    if (change && (animation === 'blur' || (animation === 'stagger' && before !== part.char))) return swap(part, before, change.run, order++);
    return plain(part, scrambled?.[index]);
  });
};
