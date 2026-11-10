import { expect, test } from '@playwright/test';

const focusIsInside = (tag: string) =>
  `(() => { let el = document.activeElement; while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement; return !!el && (el.closest('${tag}') !== null || el.getRootNode().host?.closest('${tag}') !== null); })()`;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('dialog traps focus, closes with Escape and restores focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Supprimer le produit' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Supprimer le produit ?' });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(focusIsInside('cr-dialog'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('dialog footer action runs and closes the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Supprimer le produit' }).click();
  const dialog = page.getByRole('dialog', { name: 'Supprimer le produit ?' });
  await page.locator('cr-dialog').getByRole('button', { name: 'Supprimer', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('overlay-result')).toHaveText('Produit supprimé');
});

test('dialog close button is labelled and closes the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Supprimer le produit' }).click();
  const dialog = page.getByRole('dialog', { name: 'Supprimer le produit ?' });
  await dialog.getByRole('button', { name: 'Fermer' }).click();
  await expect(dialog).toBeHidden();
});

test('drawer slides from the end edge and locks page scroll while open', async ({ page }) => {
  await page.getByRole('button', { name: 'Filtres' }).click();
  const drawer = page.getByRole('dialog', { name: 'Filtres' });
  await expect(drawer).toBeVisible();
  const box = await drawer.boundingBox();
  const width = page.viewportSize()!.width;
  expect(Math.round(box!.x + box!.width)).toBe(width);
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('');
});

test('clicking next to it closes by default, not with closeOnBackdrop false, nor after a selection that ends outside', async ({ page }) => {
  await page.getByRole('button', { name: 'Supprimer le produit' }).click();
  const dialog = page.getByRole('dialog', { name: 'Supprimer le produit ?' });
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');

  const trigger = page.getByRole('button', { name: 'Filtres' });
  await trigger.click();
  const drawer = page.getByRole('dialog', { name: 'Filtres' });
  await expect(drawer).toBeVisible();
  const box = (await drawer.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(10, box.y + 20);
  await page.mouse.up();
  await expect(drawer).toBeVisible();
  await page.mouse.click(10, box.y + 20);
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});
