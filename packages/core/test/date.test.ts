import { expect, test } from 'vitest';
import { addMonths, datePattern, fromIso, parseDate, partOrder, toIso } from '../src/utils/date';
import { en } from '../src/utils/messages-en';
import { fr } from '../src/utils/messages-fr';

test('ISO dates refuse days that overflow', () => {
  expect(toIso(fromIso('2025-03-01'))).toBe('2025-03-01');
  expect(fromIso('2025-02-31')).toBeUndefined();
  expect(fromIso('01/03/2025')).toBeUndefined();
});

test('adding a month keeps the last day of a shorter month', () => {
  expect(toIso(addMonths(fromIso('2025-01-31')!, 1))).toBe('2025-02-28');
  expect(toIso(addMonths(fromIso('2024-01-31')!, 1))).toBe('2024-02-29');
  expect(toIso(addMonths(fromIso('2025-01-15')!, -1))).toBe('2024-12-15');
});

test('typed dates follow the order of the language, whatever the separators', () => {
  expect(partOrder('fr-FR')).toEqual(['day', 'month', 'year']);
  expect(partOrder('en-US')).toEqual(['month', 'day', 'year']);
  expect(toIso(parseDate('fr-FR', '1/3/2025'))).toBe('2025-03-01');
  expect(toIso(parseDate('fr-FR', '01.03.2025'))).toBe('2025-03-01');
  expect(toIso(parseDate('en-US', '1/3/2025'))).toBe('2025-01-03');
  expect(parseDate('fr-FR', '31/02/2025')).toBeUndefined();
  expect(parseDate('fr-FR', '1/3/25')).toBeUndefined();
  expect(datePattern('fr-FR', fr.dateLetters)).toBe('JJ/MM/AAAA');
  expect(datePattern('en-US', en.dateLetters)).toBe('MM/DD/YYYY');
});
