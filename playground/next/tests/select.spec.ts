import { expect, test } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('opens with the keyboard, moves with arrows and selects with Enter', async ({ page }) => {
  const combobox = page.getByRole('combobox', { name: 'Pays' });
  await combobox.focus();
  await page.keyboard.press('ArrowDown');
  await expect(combobox).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('listbox', { name: 'Pays' })).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(combobox).toHaveAttribute('aria-expanded', 'false');
  await expect(combobox).toHaveText('Belgique');
  await expect(combobox).toBeFocused();
});

test('jumps to an option by typing its first letters', async ({ page }) => {
  const combobox = page.getByRole('combobox', { name: 'Pays' });
  await combobox.focus();
  await page.keyboard.type('su');
  await page.keyboard.press('Enter');
  await expect(combobox).toHaveText('Suisse');
});

test('closes with Escape without changing the value', async ({ page }) => {
  const combobox = page.getByRole('combobox', { name: 'Pays' });
  await combobox.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(combobox).toHaveAttribute('aria-expanded', 'false');
  await expect(combobox).toHaveText('Choisir un pays');
});

test('marks the selected option and exposes the active one', async ({ page }) => {
  const combobox = page.getByRole('combobox', { name: 'Pays' });
  await combobox.click();
  await page.getByRole('option', { name: 'France' }).click();
  await combobox.click();
  await expect(page.getByRole('option', { name: 'France' })).toHaveAttribute('aria-selected', 'true');
  await expect(combobox).toHaveAttribute('aria-activedescendant', /option-/);
  const active = await combobox.getAttribute('aria-activedescendant');
  await expect(page.locator(`cr-select[name="country"] #${active}`)).toHaveText('France');
});

test('closes when clicking outside', async ({ page }) => {
  const combobox = page.getByRole('combobox', { name: 'Pays' });
  await combobox.click();
  await expect(page.getByRole('listbox', { name: 'Pays' })).toBeVisible();
  await page.getByRole('heading', { name: 'Cristal' }).click();
  await expect(page.getByRole('listbox', { name: 'Pays' })).toBeHidden();
});

test('opens and selects with Space too', async ({ page }) => {
  const combobox = page.getByRole('combobox', { name: 'Pays' });
  await combobox.focus();
  await page.keyboard.press(' ');
  await expect(combobox).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('End');
  await page.keyboard.press(' ');
  await expect(combobox).toHaveAttribute('aria-expanded', 'false');
  await expect(combobox).toHaveText('Suisse');
});

test('works inside a drawer, above the modal layer', async ({ page }) => {
  await page.getByRole('button', { name: 'Filtres' }).click();
  const combobox = page.getByRole('combobox', { name: 'Tri' });
  await combobox.click();
  await page.getByRole('option', { name: 'Nom' }).click();
  await expect(combobox).toHaveText('Nom');
  await combobox.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox', { name: 'Tri' })).toBeHidden();
  await expect(page.getByRole('dialog', { name: 'Filtres' })).toBeVisible();
});
