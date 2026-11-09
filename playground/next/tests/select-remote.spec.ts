import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('remote: one debounced search, server results shown without local filtering', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Communes' }).click();
  const search = page.getByRole('searchbox', { name: 'Rechercher dans la liste' });
  await search.pressSequentially('690', { delay: 50 });
  await expect(page.getByText('Recherche en cours…')).toBeVisible();
  await expect(page.getByRole('listbox', { name: 'Communes' })).toHaveAttribute('aria-busy', 'true');
  const options = page.getByRole('listbox', { name: 'Communes' }).getByRole('option');
  await expect(options).toHaveText(['Lyon (69001)']);
  await expect(page.getByTestId('remote-calls')).toHaveText('Appels : 690');
  await page.keyboard.press('Enter');
  await expect(options.first()).toHaveAttribute('aria-selected', 'true');
});

test('remote: chosen labels stay in the button after new results replace them', async ({ page }) => {
  const combobox = page.getByRole('combobox', { name: 'Communes' });
  await combobox.click();
  await page.getByRole('option', { name: 'Paris (75001)' }).click();
  const search = page.getByRole('searchbox', { name: 'Rechercher dans la liste' });
  await search.fill('toul');
  const options = page.getByRole('listbox', { name: 'Communes' }).getByRole('option');
  await expect(options).toHaveText(['Toulouse (31000)']);
  await options.first().click();
  await page.keyboard.press('Escape');
  await expect(combobox).toHaveText('Paris (75001), Toulouse (31000)');
});

test('remote: closing resets the search and asks for default results', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Communes' }).click();
  await page.getByRole('searchbox', { name: 'Rechercher dans la liste' }).fill('zzz');
  await expect(page.getByText('Aucun résultat')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('remote-calls')).toHaveText('Appels : zzz | ');
  await page.getByRole('combobox', { name: 'Communes' }).click();
  await expect(page.getByRole('listbox', { name: 'Communes' }).getByRole('option')).toHaveCount(5);
});
