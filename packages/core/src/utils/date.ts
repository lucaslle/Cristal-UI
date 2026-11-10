import type { Messages } from './i18n';

// Dates à minuit UTC, lues avec les méthodes getUTC* : le fuseau horaire de la machine ne décale jamais le jour.

const DAY_MS = 86_400_000;
type Part = 'day' | 'month' | 'year';

const utc = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day));

export const fromIso = (iso?: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  return match ? valid(Number(match[1]), Number(match[2]), Number(match[3])) : undefined;
};

// Refuse les dates qui débordent (31/02 donnerait le 3 mars).
const valid = (year: number, month: number, day: number) => {
  const date = utc(year, month - 1, day);
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : undefined;
};

export const toIso = (date?: Date) => (date ? date.toISOString().slice(0, 10) : '');

export const sameDay = (a?: Date, b?: Date) => !!a && !!b && a.getTime() === b.getTime();

export const today = () => {
  const now = new Date();
  return utc(now.getFullYear(), now.getMonth(), now.getDate());
};

export const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS);

/** Même jour n mois plus tard, ramené au dernier jour du mois s'il n'existe pas (31 janvier + 1 mois = 28 ou 29 février). */
export const addMonths = (date: Date, months: number) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  return utc(year, month, Math.min(date.getUTCDate(), utc(year, month + 1, 0).getUTCDate()));
};

export const monthStart = (date: Date) => utc(date.getUTCFullYear(), date.getUTCMonth(), 1);
export const monthEnd = (date: Date) => utc(date.getUTCFullYear(), date.getUTCMonth() + 1, 0);

/** Sens d'un changement de mois, ou undefined dans le même mois. */
export const monthDirection = (from: Date, to: Date) => {
  const month = (day: Date) => day.getUTCFullYear() * 12 + day.getUTCMonth();
  return month(to) === month(from) ? undefined : month(to) > month(from) ? 'next' : 'prev';
};

export const clampDate = (date: Date, min?: Date, max?: Date) => (min && date < min ? min : max && date > max ? max : date);

export const inRange = (date: Date, min?: Date, max?: Date) => clampDate(date, min, max) === date;

/** Position dans la semaine, 0 pour le premier jour (lundi en français, dimanche en anglais). */
const weekday = (date: Date, firstDay: number) => (date.getUTCDay() - firstDay + 7) % 7;

/** Semaines du mois de date, de 7 cases ; undefined pour les cases hors du mois. */
export const monthWeeks = (date: Date, firstDay: number) => {
  const offset = weekday(monthStart(date), firstDay);
  const count = monthEnd(date).getUTCDate();
  const cells = Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => index - offset + 1);
  const days = cells.map((day) => (day >= 1 && day <= count ? utc(date.getUTCFullYear(), date.getUTCMonth(), day) : undefined));
  return Array.from({ length: days.length / 7 }, (_, week) => days.slice(week * 7, week * 7 + 7));
};

/** Les 7 jours d'une semaine type, dans l'ordre de la langue (le 7 janvier 2024 est un dimanche). */
export const weekDays = (firstDay: number) => Array.from({ length: 7 }, (_, index) => utc(2024, 0, 7 + ((firstDay + index) % 7)));

/** Jour visé par une touche de la grille (motif Date Picker Dialog de l'APG). */
export const dateForKey = (key: string, date: Date, shift: boolean, firstDay: number) =>
  ({
    ArrowLeft: () => addDays(date, -1),
    ArrowRight: () => addDays(date, 1),
    ArrowUp: () => addDays(date, -7),
    ArrowDown: () => addDays(date, 7),
    Home: () => addDays(date, -weekday(date, firstDay)),
    End: () => addDays(date, 6 - weekday(date, firstDay)),
    PageUp: () => addMonths(date, shift ? -12 : -1),
    PageDown: () => addMonths(date, shift ? 12 : 1),
  })[key]?.();

const numeric = (locale: string) => new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });

/** Ordre du jour, du mois et de l'année dans la langue : jour, mois, année en français ; mois, jour, année en anglais. */
export const partOrder = (locale: string) =>
  numeric(locale)
    .formatToParts(utc(2024, 0, 7))
    .map((part) => part.type)
    .filter((type): type is Part => type === 'day' || type === 'month' || type === 'year');

/** Format attendu, avec les lettres de la langue : JJ/MM/AAAA, MM/DD/YYYY. */
export const datePattern = (locale: string, letters: Record<Part, string>) => partOrder(locale).map((part) => letters[part]).join('/');

export const formatDate = (locale: string, date?: Date) => (date ? numeric(locale).format(date) : '');

export const formatLong = (locale: string, date: Date) => new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);

/** Lit une date saisie dans l'ordre de la langue, quels que soient les séparateurs (1/3/2025, 01.03.2025…). */
export const parseDate = (locale: string, text: string) => {
  const numbers = text.split(/\D+/).filter(Boolean);
  const order = partOrder(locale);
  if (numbers.length !== 3 || numbers[order.indexOf('year')].length !== 4) return undefined;
  const get = (part: Part) => Number(numbers[order.indexOf(part)]);
  return valid(get('year'), get('month'), get('day'));
};

/** Contrainte non respectée par le texte saisi : drapeau de validité et message, ou rien. */
export const dateProblem = (text: string, locale: string, m: Messages, required: boolean, min?: Date, max?: Date): [keyof ValidityStateFlags | undefined, string] => {
  const date = parseDate(locale, text);
  if (!text.trim()) return required ? ['valueMissing', m.required] : [undefined, ''];
  if (!date) return ['badInput', m.dateFormat(datePattern(locale, m.dateLetters))];
  if (inRange(date, min, max)) return [undefined, ''];
  return [min && date < min ? 'rangeUnderflow' : 'rangeOverflow', m.dateRange(formatDate(locale, min), formatDate(locale, max))];
};
