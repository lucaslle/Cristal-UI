import { expect, test } from 'vitest';
import { caretAfter, cardError, expiryError, formatExpiry, groupCard, luhn } from '../src/utils/card';
import { fr } from '../src/utils/messages-fr';

test('Luhn key accepts a valid number and catches a typo', () => {
  expect(luhn('4242424242424242')).toBe(true);
  expect(luhn('4242424242424241')).toBe(false);
  expect(luhn('378282246310005')).toBe(true);
});

test('groups by 4, and 4-6-5 for American Express', () => {
  expect(groupCard('42424242')).toBe('4242 4242');
  expect(groupCard('378282246310005')).toBe('3782 822463 10005');
});

test('the caret lands right after the n-th digit', () => {
  expect(caretAfter('4242 4242', 4)).toBe(4);
  expect(caretAfter('4242 4242', 5)).toBe(6);
  expect(caretAfter('4242', 9)).toBe(4);
});

test('expiry: MM/YY format, month range, expired cards', () => {
  const now = new Date(2026, 10, 13);
  expect(formatExpiry('1227')).toBe('12/27');
  expect(formatExpiry('1')).toBe('1');
  expect(expiryError('12/27', fr, now)).toBe('');
  expect(expiryError('11/26', fr, now)).toBe('');
  expect(expiryError('10/26', fr, now)).toBe(fr.expired);
  expect(expiryError('13/27', fr, now)).toBe(fr.expiryMonth);
  expect(expiryError('1227', fr, now)).toBe(fr.expiryFormat);
});

test('card number: missing digits first, then the Luhn key', () => {
  expect(cardError('4242', fr)).toBe(fr.cardDigits(16));
  expect(cardError('37828224631000', fr)).toBe(fr.cardDigits(15));
  expect(cardError('4242424242424241', fr)).toBe(fr.cardInvalid);
  expect(cardError('4242424242424242', fr)).toBe('');
});
