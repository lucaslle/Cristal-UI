export const digitsOf = (text: string) => text.replace(/\D/g, '');

const isAmex = (digits: string) => /^3[47]/.test(digits);

/** Longueur d'un numéro complet : 15 chiffres pour American Express, 16 sinon. */
export const cardLength = (digits: string) => (isAmex(digits) ? 15 : 16);

/** Groupes de 4 chiffres (4-6-5 pour American Express). */
export const groupCard = (digits: string) => {
  const sizes = isAmex(digits) ? [4, 6, 5] : [4, 4, 4, 4];
  const groups: string[] = [];
  let rest = digits;
  for (const size of sizes) {
    if (!rest) break;
    groups.push(rest.slice(0, size));
    rest = rest.slice(size);
  }
  return groups.join(' ');
};

/** Position du curseur juste après le n-ième chiffre du texte formaté. */
export const caretAfter = (text: string, count: number) => {
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (seen === count) return i;
    if (/\d/.test(text[i])) seen++;
  }
  return text.length;
};

/** Clé de Luhn : détecte la plupart des fautes de frappe dans un numéro de carte. */
export const luhn = (digits: string) =>
  digits
    .split('')
    .reverse()
    .reduce((sum, char, i) => {
      const n = Number(char) * (i % 2 ? 2 : 1);
      return sum + (n > 9 ? n - 9 : n);
    }, 0) %
    10 ===
  0;

export const formatExpiry = (text: string) => {
  const digits = digitsOf(text).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export const expiryError = (expiry: string, now = new Date()) => {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return 'Saisissez la date d’expiration au format MM/AA.';
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return 'Le mois doit être compris entre 01 et 12.';
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return 'Cette carte est expirée.';
  return '';
};

export const cardError = (digits: string) => {
  if (digits.length < cardLength(digits)) return `Saisissez les ${cardLength(digits)} chiffres de la carte.`;
  return luhn(digits) ? '' : 'Ce numéro de carte n’est pas valide. Vérifiez les chiffres.';
};
