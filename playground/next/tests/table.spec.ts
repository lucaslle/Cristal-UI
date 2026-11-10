import { expect, test, type Page } from '@playwright/test';

const table = (page: Page) => page.locator('cr-table[label="Commandes de la semaine"]');
const order = (page: Page) => table(page).locator('th .text').allTextContents();
const header = (page: Page, name: string) => table(page).getByRole('columnheader', { name: new RegExp(`^${name}`) });
const status = (page: Page) => table(page).locator('[role="status"]');
const width = (page: Page, name: string) => header(page, name).evaluate((th) => (th as HTMLElement).offsetWidth);

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(header(page, 'Statut')).toBeVisible();
});

test('renders a real table with a summary of the layout', async ({ page }) => {
  await expect(table(page).getByRole('table', { name: 'Commandes de la semaine' })).toBeVisible();
  await expect.poll(() => order(page)).toEqual(['Montant', 'Statut', 'Canal', 'Région', 'Produit', 'Unités', 'Remise']);
  await expect(header(page, 'Montant')).toHaveAccessibleName(/fixée/);
  await expect(table(page).getByText('7 colonnes sur 7 · 1 fixée · lignes normales')).toBeVisible();
});

test('keyboard: arrows move between headers, Alt moves the column and stays in its group', async ({ page }) => {
  await header(page, 'Statut').click();
  await page.keyboard.press('ArrowRight');
  await expect(header(page, 'Canal')).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Alt+ArrowRight');
  await expect.poll(() => order(page)).toEqual(['Montant', 'Canal', 'Statut', 'Région', 'Produit', 'Unités', 'Remise']);
  await expect(status(page)).toHaveText('Statut déplacée en position 3 sur 7.');
  await expect(header(page, 'Statut')).toBeFocused();
  await page.keyboard.press('Alt+ArrowLeft');
  await page.keyboard.press('Alt+ArrowLeft');
  await expect(status(page)).toHaveText('Statut ne peut pas aller plus loin.');
  await expect.poll(async () => (await order(page))[0]).toBe('Montant');
});

test('keyboard: Shift resizes, Enter fits, F pins and M hides', async ({ page }) => {
  await header(page, 'Canal').click();
  const before = await width(page, 'Canal');
  await page.keyboard.press('Shift+ArrowRight');
  await expect.poll(() => width(page, 'Canal')).toBe(before + 16);
  await page.keyboard.press('Enter');
  await expect.poll(() => width(page, 'Canal')).toBeLessThan(before);
  await header(page, 'Produit').click();
  await page.keyboard.press('f');
  await expect.poll(async () => (await order(page)).slice(0, 2)).toEqual(['Montant', 'Produit']);
  await expect(header(page, 'Produit')).toHaveCSS('position', 'sticky');
  await expect(header(page, 'Produit')).toBeFocused();
  await header(page, 'Région').click();
  await page.keyboard.press('m');
  await expect(header(page, 'Région')).toHaveCount(0);
  await expect(header(page, 'Unités')).toBeFocused();
  await expect(table(page).getByText('6 colonnes sur 7 · 2 fixées · lignes normales')).toBeVisible();
});

test('mouse: dragging a header moves the column, dragging the handle resizes it', async ({ page }) => {
  await table(page).scrollIntoViewIfNeeded();
  const from = await header(page, 'Statut').boundingBox();
  const to = await header(page, 'Produit').boundingBox();
  await page.mouse.move(from!.x + 20, from!.y + from!.height / 2);
  await page.mouse.down();
  await page.mouse.move(from!.x + 60, from!.y + 10, { steps: 4 });
  await expect(table(page).locator('td.flying').first()).toBeVisible();
  await page.mouse.move(to!.x + to!.width / 2, to!.y + 10, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => order(page)).toEqual(['Montant', 'Canal', 'Région', 'Produit', 'Statut', 'Unités', 'Remise']);
  await expect.poll(() => table(page).evaluate((el) => el.shadowRoot!.getAnimations().length)).toBe(0);
  const before = await width(page, 'Canal');
  const box = await header(page, 'Canal').boundingBox();
  await page.mouse.move(box!.x + box!.width - 3, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width + 57, box!.y + box!.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect.poll(() => width(page, 'Canal')).toBe(before + 60);
  await expect.poll(() => order(page)).toEqual(['Montant', 'Canal', 'Région', 'Produit', 'Statut', 'Unités', 'Remise']);
});

test('columns menu, density, persistence and reset', async ({ page }) => {
  await table(page).getByRole('button', { name: /Colonnes/ }).click();
  await table(page).getByRole('checkbox', { name: 'Canal' }).uncheck();
  await expect(header(page, 'Canal')).toHaveCount(0);
  await expect(table(page).getByRole('button', { name: /Colonnes/ })).toHaveText('Colonnes6/7');
  await page.keyboard.press('Escape');
  await expect(table(page).getByRole('button', { name: /Colonnes/ })).toBeFocused();
  await expect(table(page).getByRole('group', { name: 'Colonnes affichées' })).toBeHidden();
  await table(page).getByRole('button', { name: /Colonnes/ }).click();
  await table(page).getByRole('button', { name: /Colonnes/ }).press('Escape');
  await expect(table(page).getByRole('group', { name: 'Colonnes affichées' })).toBeHidden();
  const rowHeight = () => table(page).locator('tbody tr').first().evaluate((tr) => (tr as HTMLElement).offsetHeight);
  const normal = await rowHeight();
  await table(page).getByText('Compacte').click();
  await expect.poll(rowHeight).toBeLessThan(normal);
  await page.reload();
  await expect(header(page, 'Statut')).toBeVisible();
  await expect(header(page, 'Canal')).toHaveCount(0);
  await expect(table(page).getByText('6 colonnes sur 7 · 1 fixée · lignes compactes')).toBeVisible();
  await table(page).getByRole('button', { name: 'Réinitialiser' }).click();
  await expect.poll(() => order(page)).toEqual(['Montant', 'Statut', 'Canal', 'Région', 'Produit', 'Unités', 'Remise']);
  await expect(table(page).getByText('7 colonnes sur 7 · 1 fixée · lignes normales')).toBeVisible();
});

test('reordering slides the columns, except with reduced motion', async ({ page }) => {
  await header(page, 'Statut').click();
  await page.keyboard.press('Alt+ArrowRight');
  expect(await table(page).evaluate((el) => el.shadowRoot!.getAnimations().length)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.press('Alt+ArrowRight');
  await page.waitForTimeout(400);
  await page.keyboard.press('Alt+ArrowRight');
  expect(await table(page).evaluate((el) => el.shadowRoot!.getAnimations().length)).toBe(0);
});

test('status values render as coloured badges', async ({ page }) => {
  const chip = table(page).locator('td .chip.success').first();
  await expect(chip).toHaveText('Payée');
  await expect(table(page).locator('td .chip.warning').first()).toHaveText('En attente');
});

for (const variant of ['striped', 'cards', 'minimal', 'grid']) {
  test(`variant ${variant} applies and stays accessible`, async ({ page }) => {
    const AxeBuilder = (await import('@axe-core/playwright')).default;
    await page.getByRole('combobox', { name: 'Style du tableau' }).click();
    await page.getByRole('option', { name: variant }).click();
    await expect(table(page)).toHaveAttribute('data-variant', variant);
    const result = await new AxeBuilder({ page }).include('cr-table[label="Commandes de la semaine"]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
  });
}
