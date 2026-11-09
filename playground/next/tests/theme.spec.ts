import { expect, test } from '@playwright/test';

const style = (page: import('@playwright/test').Page, name: string, property: 'backgroundColor' | 'color') =>
  page.getByRole('button', { name, exact: true }).evaluate((button, key) => getComputedStyle(button)[key], property);

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('violet is the default primary color', async ({ page }) => {
  expect(await style(page, 'Principal', 'backgroundColor')).toBe('rgb(109, 40, 217)');
  expect(await style(page, 'Principal', 'color')).toMatch(/^(rgb\(255, 255, 255\)|oklch\(1 0 0\))$/);
});

test('one variable themes the whole app and derives every shade', async ({ page }) => {
  await page.evaluate(() => document.documentElement.style.setProperty('--cr-color-primary', '#0f766e'));
  expect(await style(page, 'Principal', 'backgroundColor')).toBe('rgb(15, 118, 110)');
  const secondaryBackground = await style(page, 'Secondaire', 'backgroundColor');
  expect(secondaryBackground).not.toBe('rgb(237, 233, 254)');
  expect(secondaryBackground).not.toBe('rgba(0, 0, 0, 0)');
});

test('a light primary color switches the button text to black', async ({ page }) => {
  await page.evaluate(() => document.documentElement.style.setProperty('--cr-color-primary', '#facc15'));
  expect(await style(page, 'Principal', 'color')).toMatch(/^(rgb\(0, 0, 0\)|oklch\(0 0 0\))$/);
});

test('the cr-theme class limits a theme to one area', async ({ page }) => {
  expect(await style(page, 'Thème rose', 'backgroundColor')).toBe('rgb(225, 29, 72)');
  expect(await style(page, 'Principal', 'backgroundColor')).toBe('rgb(109, 40, 217)');
});
