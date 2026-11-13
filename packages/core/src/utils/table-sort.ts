export type SortDirection = 'ascending' | 'descending';

export interface TableSort {
  key: string;
  direction: SortDirection;
}

/** Tri suivant après un clic sur l'en-tête `key` : croissant, décroissant, puis ordre d'origine. */
export const nextSort = (sort: TableSort | undefined, key: string): TableSort | undefined =>
  sort?.key !== key ? { key, direction: 'ascending' } : sort.direction === 'ascending' ? { key, direction: 'descending' } : undefined;

const isEmpty = (value: unknown) => value === null || value === undefined || value === '';

/** Nombres et dates par valeur, textes dans l'ordre de la langue (« 10 » après « 9 ») ; les cases vides restent en bas. */
export const sortRows = <T extends Record<string, unknown>>(rows: T[], sort: TableSort | undefined, locale: string): T[] => {
  if (!sort) return rows;
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
  const sign = sort.direction === 'ascending' ? 1 : -1;
  const compare = (a: unknown, b: unknown) =>
    typeof a === 'number' && typeof b === 'number' ? a - b : a instanceof Date && b instanceof Date ? a.getTime() - b.getTime() : collator.compare(String(a), String(b));
  return [...rows].sort((x, y) => {
    const a = x[sort.key];
    const b = y[sort.key];
    if (isEmpty(a) || isEmpty(b)) return Number(isEmpty(a)) - Number(isEmpty(b));
    return sign * compare(a, b);
  });
};

/** sortRows mémorisé : ne retrie que si les lignes, le tri ou la langue changent. */
export const sortCache = () => {
  let last: { rows: Record<string, unknown>[]; sort?: TableSort; locale: string; result: Record<string, unknown>[] } | undefined;
  return (rows: Record<string, unknown>[], sort: TableSort | undefined, locale: string) => {
    if (last?.rows !== rows || last.sort !== sort || last.locale !== locale) last = { rows, sort, locale, result: sortRows(rows, sort, locale) };
    return last.result;
  };
};
