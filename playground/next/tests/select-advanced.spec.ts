import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('multiple: Enter toggles options and keeps the list open', async ({ page }) => {
  const combobox = page.getByRole('combobox', { name: 'Langues parlées' });
  await combobox.click();
  const listbox = page.getByRole('listbox', { name: 'Langues parlées' });
  await expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(listbox).toBeVisible();
  await expect(page.getByRole('option', { name: 'Français' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('option', { name: 'Espagnol' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('option', { name: 'Anglais' })).toHaveAttribute('aria-selected', 'false');
  await page.keyboard.press('Escape');
  await expect(listbox).toBeHidden();
  await expect(combobox).toHaveText('Français, Espagnol');
  await expect(combobox).toBeFocused();
});

test('multiple: clicking an option twice unselects it', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Langues parlées' }).click();
  const option = page.getByRole('option', { name: 'Italien' });
  await option.click();
  await expect(option).toHaveAttribute('aria-selected', 'true');
  await option.click();
  await expect(option).toHaveAttribute('aria-selected', 'false');
});

test('multiple: sends every value, is required, and resets', async ({ page }) => {
  await page.getByRole('button', { name: 'Valider' }).click();
  const combobox = page.getByRole('combobox', { name: 'Langues parlées' });
  await expect(combobox).toHaveAccessibleDescription('Choisissez au moins une option dans la liste.');
  await expect(page.getByTestId('select-sent')).toHaveText('Envoyé :');
  await combobox.click();
  await page.getByRole('option', { name: 'Anglais' }).click();
  await page.getByRole('option', { name: 'Japonais' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByTestId('select-sent')).toHaveText('Envoyé : {"languages":["anglais","japonais"],"city":null}');
  await page.getByRole('button', { name: 'Effacer' }).click();
  await expect(combobox).toHaveText('Choisir des langues');
});

test('search filters options, ignoring accents and case', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Ville' }).click();
  const search = page.getByRole('searchbox', { name: 'Rechercher dans la liste' });
  await expect(search).toBeFocused();
  await search.fill('EV');
  await expect(page.getByRole('listbox', { name: 'Ville' }).getByRole('option')).toHaveText(['Évry']);
  await search.fill('ly');
  await expect(page.getByRole('listbox', { name: 'Ville' }).getByRole('option')).toHaveText(['Lyon', 'Écully']);
});

test('search: arrows and Enter pick from the filtered options, focus returns to the field', async ({ page }) => {
  const combobox = page.getByRole('combobox', { name: 'Ville' });
  await combobox.focus();
  await page.keyboard.press('b');
  const search = page.getByRole('searchbox', { name: 'Rechercher dans la liste' });
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('b');
  await page.keyboard.type('or');
  await page.keyboard.press('Enter');
  await expect(combobox).toHaveText('Bordeaux');
  await expect(combobox).toBeFocused();
});

test('search: Space types a space instead of selecting, and no match is announced', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Ville' }).click();
  const search = page.getByRole('searchbox', { name: 'Rechercher dans la liste' });
  await page.keyboard.type('zz z');
  await expect(search).toHaveValue('zz z');
  await expect(page.getByRole('status').filter({ hasText: 'Aucun résultat' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('combobox', { name: 'Ville' })).toHaveText('Choisir une ville');
});

test('multiple + search: filter, toggle, and the search resets on close', async ({ page }) => {
  const combobox = page.getByRole('combobox', { name: 'Langues parlées' });
  await combobox.click();
  const search = page.getByRole('searchbox', { name: 'Rechercher dans la liste' });
  await search.fill('al');
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await expect(combobox).toHaveText('Allemand, Italien');
  await combobox.click();
  await expect(page.getByRole('searchbox', { name: 'Rechercher dans la liste' })).toHaveValue('');
});
