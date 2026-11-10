import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const field = (page: import('@playwright/test').Page) => page.getByRole('searchbox', { name: 'Rechercher un produit' });
const host = 'cr-search';

test('the magnifier becomes a clear button only inside the field', async ({ page }) => {
  const clear = page.locator(host).locator('button.icon');
  await expect(clear).toHaveAttribute('aria-hidden', 'true');
  await expect(clear).toHaveAttribute('tabindex', '-1');
  await field(page).fill('Lam');
  await expect(page.getByRole('list', { name: 'Résultats' }).getByRole('listitem')).toHaveText(['Lampe']);
  await page.getByRole('button', { name: 'Effacer la recherche' }).click();
  await expect(field(page)).toHaveValue('');
  await expect(field(page)).toBeFocused();
});

test('no results is announced, Escape clears and Enter submits', async ({ page }) => {
  await field(page).fill('xyzzy');
  await expect(page.locator(host).getByRole('status')).toContainText('Aucun résultat pour « xyzzy »');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('search-submitted')).toHaveText('xyzzy');
  await page.keyboard.press('Escape');
  await expect(field(page)).toHaveValue('');
  await expect(page.locator(host).getByRole('status')).toHaveText('');
});

test('a recent chip becomes the query', async ({ page }) => {
  const recent = page.getByRole('list', { name: 'Récentes' });
  await recent.getByRole('button', { name: 'tapis' }).click();
  await expect(field(page)).toHaveValue('tapis');
  await expect(field(page)).toBeFocused();
  await expect(page.getByRole('list', { name: 'Résultats' }).getByRole('listitem')).toHaveText(['Tapis']);
  await expect(recent).toHaveCount(0);
});

test('the placeholder word rolls, then stops on the last one', async ({ page }) => {
  const word = page.locator(host).locator('.word');
  await expect(word).toHaveText('une lampe');
  await expect(word).toHaveText('une chaise', { timeout: 2000 });
  await expect(word).toHaveText('un tapis', { timeout: 2000 });
  await page.waitForTimeout(1200);
  await expect(word).toHaveText('un tapis');
});

test('search loader is a named status', async ({ page }) => {
  await expect(page.getByRole('status').filter({ hasText: 'Recherche en cours…' })).toBeAttached();
});
