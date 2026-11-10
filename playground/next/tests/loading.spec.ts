import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('progress: indeterminate has no value, determinate counts up to the new value', async ({ page }) => {
  await expect(page.getByRole('progressbar', { name: 'Import' })).not.toHaveAttribute('aria-valuenow');
  const upload = page.getByRole('progressbar', { name: 'Téléversement' });
  await expect(upload).toHaveAttribute('aria-valuenow', '0');
  await page.getByRole('button', { name: 'Lancer le téléversement' }).click();
  await expect(upload).toHaveAttribute('aria-valuenow', '100');
  const shown = page.locator('cr-progress[show-value]').locator('.value');
  await expect(shown).not.toHaveText('100%');
  await expect(shown).toHaveText('100%');
});

test('progress steps: only reached steps show, past ones are completed', async ({ page }) => {
  const list = page.getByRole('list', { name: 'Réponse' });
  await expect(list.getByRole('listitem')).toHaveText(['Recherche (en cours)']);
  await page.getByRole('button', { name: 'Étape suivante' }).click();
  await expect(list.getByRole('listitem')).toHaveText(['Recherche (terminée)', 'Lecture (en cours)']);
  await expect(list.locator('[aria-current="step"]')).toHaveText('Lecture (en cours)');
});

test('loader, skeleton and image', async ({ page }) => {
  await expect(page.getByRole('status').filter({ hasText: 'Chargement…' }).first()).toBeAttached();
  await expect(page.getByRole('status').filter({ hasText: 'Chargement des messages…' })).toBeAttached();
  await expect(page.locator('cr-skeleton').first()).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByRole('img', { name: 'Aplat violet' })).toBeVisible();
  await expect(page.locator('cr-image')).toHaveAttribute('data-loaded', '');
});
