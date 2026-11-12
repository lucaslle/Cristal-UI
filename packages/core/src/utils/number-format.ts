export type NumberPart = { key: string; char: string; digit: boolean };

export type NumberTrend = 'up' | 'down';

/**
 * Le nombre formaté dans la langue, caractère par caractère. Chaque chiffre a une clé par rang (unités, dizaines…,
 * puis décimales) : il garde sa place quand le nombre s'allonge, et les nouveaux rangs apparaissent à gauche.
 */
export const numberParts = (value: number, decimals: number, locale: string): NumberPart[] => {
  const digits = Math.min(20, Math.max(0, Math.trunc(decimals) || 0));
  // formatToParts des nombres vient de es2018.intl, au-delà de la lib es2017 du projet.
  const format = new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }) as Intl.NumberFormat & {
    formatToParts(value: number): { type: string; value: string }[];
  };
  const parts = format.formatToParts(value);
  let rank = parts.filter((part) => part.type === 'integer').reduce((count, part) => count + part.value.length, 0);
  let fraction = 0;
  const result: NumberPart[] = [];
  for (const part of parts) {
    [...part.value].forEach((char, index) => {
      if (part.type === 'integer') result.push({ key: `i${--rank}`, char, digit: true });
      else if (part.type === 'fraction') result.push({ key: `f${fraction++}`, char, digit: true });
      else result.push({ key: part.type === 'group' ? `g${rank}` : `${part.type}${index}`, char, digit: false });
    });
  }
  return result;
};

export const formatNumber = (parts: NumberPart[]) => parts.map((part) => part.char).join('');

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Fait compter de from à to en duration ms (ralenti à la fin) ; renvoie de quoi l'arrêter. */
export const tween = (from: number, to: number, duration: number, onFrame: (value: number) => void) => {
  const start = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    onFrame(progress < 1 ? from + (to - from) * (1 - (1 - progress) ** 3) : to);
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
};

/**
 * Brouille les chiffres (indices dans parts) puis les fige de gauche à droite en duration ms.
 * onFrame reçoit les caractères à afficher à la place des chiffres pas encore figés, puis undefined à la fin.
 */
export const scramble = (parts: NumberPart[], duration: number, onFrame: (chars?: string[]) => void) => {
  const digits = parts.map((part, index) => (part.digit ? index : -1)).filter((index) => index >= 0);
  const start = performance.now();
  const tick = () => {
    const elapsed = performance.now() - start;
    // Un premier tiers où tout tourne, puis un chiffre se fige à intervalle régulier.
    const locked = Math.floor(((elapsed - duration / 3) / ((duration * 2) / 3)) * digits.length) + 1;
    if (locked <= digits.length && elapsed < duration) {
      const chars: string[] = [];
      for (const index of digits.slice(Math.max(0, locked))) chars[index] = String(Math.floor(Math.random() * 10));
      onFrame(chars);
      return;
    }
    clearInterval(timer);
    onFrame(undefined);
  };
  const timer = setInterval(tick, 45);
  tick();
  return () => clearInterval(timer);
};
