import { expect, test, type Page } from '@playwright/test';

const table = (page: Page) => page.locator('cr-table[label="Stock"]');
const header = (page: Page, name: string) => table(page).getByRole('columnheader', { name: new RegExp(`^${name}`) });
const names = (page: Page) => table(page).locator('tbody td[data-key="name"]').allTextContents();
const state = (page: Page) => page.getByTestId('stock-state');
const status = (page: Page) => table(page).locator('[role="status"]');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await table(page).scrollIntoViewIfNeeded();
  await expect(header(page, 'Prix')).toBeVisible();
});

test('sorts by value on click: ascending, descending, then original order', async ({ page }) => {
  await header(page, 'Prix').click();
  await expect(header(page, 'Prix')).toHaveAttribute('aria-sort', 'ascending');
  await expect.poll(() => names(page)).toEqual(['Câble USB-C', 'Souris sans fil', 'Clavier mécanique', 'Écran 27 pouces', 'Casque audio']);
  await expect(status(page)).toHaveText('Trié par Prix, ordre croissant.');
  await header(page, 'Prix').click();
  await expect.poll(async () => (await names(page))[0]).toBe('Casque audio');
  await header(page, 'Prix').click();
  await expect(header(page, 'Prix')).not.toHaveAttribute('aria-sort');
  await expect.poll(async () => (await names(page))[0]).toBe('Écran 27 pouces');
  await expect(table(page).locator('td[data-key="price"]').first()).toHaveText('329,00 €');
});

test('keyboard: S sorts the focused column, text sorts in French order', async ({ page }) => {
  await header(page, 'Produit').focus();
  await page.keyboard.press('s');
  await expect.poll(() => names(page)).toEqual(['Câble USB-C', 'Casque audio', 'Clavier mécanique', 'Écran 27 pouces', 'Souris sans fil']);
  await header(page, 'Actions').focus();
  await page.keyboard.press('s');
  await expect(header(page, 'Actions')).not.toHaveAttribute('aria-sort');
  await expect(table(page).getByText(/S\s+trier/)).toBeVisible();
});

test('selection: row boxes, select all and indeterminate state', async ({ page }) => {
  const all = table(page).getByRole('checkbox', { name: 'Sélectionner toutes les lignes' });
  await expect(table(page).getByRole('checkbox', { name: 'Sélectionner Câble USB-C' })).toBeChecked();
  await expect.poll(() => all.evaluate((box) => (box as HTMLInputElement).indeterminate)).toBe(true);
  await table(page).getByRole('checkbox', { name: 'Sélectionner Casque audio' }).check();
  await expect(state(page)).toContainText('Cochées : 2, 5');
  await expect(status(page)).toHaveText('2 lignes sélectionnées.');
  await all.check();
  await expect(state(page)).toContainText('Cochées : 1, 2, 3, 4, 5');
  await all.uncheck();
  await expect(state(page)).toContainText('Cochées : aucune');
});

test('row click opens the row, slotted actions and checkboxes do not', async ({ page }) => {
  await table(page).locator('td[data-key="quantity"]').nth(2).click();
  await expect(state(page)).toContainText('ouverte : Clavier mécanique');
  await table(page).getByRole('button', { name: 'Câble USB-C' }).press('Enter');
  await expect(state(page)).toContainText('ouverte : Câble USB-C');
  await page.locator('cr-button[slot="actions-4"]').click();
  await expect(state(page)).toContainText('réassort : Souris sans fil');
  await table(page).getByRole('checkbox', { name: 'Sélectionner Souris sans fil' }).check();
  await expect(state(page)).toContainText('réassort : Souris sans fil');
});

test('stays accessible with selection and sorting', async ({ page }) => {
  const AxeBuilder = (await import('@axe-core/playwright')).default;
  await header(page, 'Quantité').click();
  const result = await new AxeBuilder({ page }).include('cr-table[label="Stock"]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(result.violations).toEqual([]);
});
