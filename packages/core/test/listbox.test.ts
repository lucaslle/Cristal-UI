import { describe, expect, test } from 'vitest';
import { matchIndex, matchRange, normalize } from '../src/utils/listbox';

const options = (...labels: string[]) => labels.map((label) => ({ value: label, label: label.replace('!', ''), disabled: label.endsWith('!') }));

describe('normalize', () => {
  test('drops accents and case', () => expect(normalize('Écran Été')).toBe('ecran ete'));
});

describe('matchRange', () => {
  test('finds the query without accents or case, in the original label', () => {
    expect(matchRange('Paramètres', 'parametres')).toEqual([0, 10]);
    const [start, end] = matchRange('Créer une facture', 'er')!;
    expect('Créer une facture'.slice(start, end)).toBe('er');
  });

  test('counts emoji as one character', () => {
    const label = 'Ça 👍 va';
    const [start, end] = matchRange(label, 'VA')!;
    expect(label.slice(start, end)).toBe('va');
  });

  test('nothing for an empty or missing query', () => {
    expect(matchRange('Lyon', '  ')).toBeUndefined();
    expect(matchRange('Lyon', 'paris')).toBeUndefined();
  });
});

describe('matchIndex', () => {
  test('type-ahead skips disabled options and wraps around', () => {
    const list = options('Banane', 'Abricot', 'Bleuet!', 'Brugnon');
    expect(matchIndex(list, 'b', 1)).toBe(3);
    expect(matchIndex(list, 'b', 3)).toBe(0);
    expect(matchIndex(list, 'z', 0)).toBe(-1);
  });
});
