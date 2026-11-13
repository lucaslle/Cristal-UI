import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('cr-kbd: a shortcut is a kbd of kbd keys, Mod reads as Ctrl outside a Mac', async ({ page }) => {
  const keys = page.getByTestId('kbd-combo').locator('kbd.key');
  await expect(keys).toHaveText(['Ctrl', 'Maj', 'K']);
  await expect(page.getByTestId('kbd-combo').locator('kbd.combo')).toHaveCount(1);
});

test('cr-confirm: the button turns into a question, Cancel and Escape bring it back with focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Supprimer rapport.pdf' });
  await trigger.click();
  const question = page.getByRole('group', { name: 'Supprimer rapport.pdf ?' });
  await expect(question).toBeVisible();
  await expect(trigger).toBeHidden();
  await expect(question.getByRole('button', { name: 'Annuler' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(question).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.keyboard.press('Enter');
  await question.getByRole('button', { name: 'Annuler' }).click();
  await expect(trigger).toBeFocused();
});

test('cr-confirm: confirming runs the action', async ({ page }) => {
  await page.getByRole('button', { name: 'Supprimer devis.docx' }).click();
  await page.getByRole('group', { name: 'Supprimer devis.docx ?' }).getByRole('button', { name: 'Supprimer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Supprimer devis.docx' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Supprimer rapport.pdf' })).toBeVisible();
});

test('cr-hover-card: opens on hover and keyboard focus, stays while hovered, Escape closes it', async ({ page }) => {
  const link = page.getByRole('link', { name: 'Mia Laurent' });
  const card = page.getByText('Designer produit à Lyon');
  await expect(card).toBeHidden();
  await link.hover();
  await expect(card).toBeVisible();
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
  await page.waitForTimeout(400);
  await expect(card).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(card).toBeHidden();
  await page.mouse.move(0, 0);

  await link.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(card).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(card).toBeHidden();
});

test('cr-code-block: Copy writes the code to the clipboard and announces it', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const block = page.locator('cr-code-block[label="Terminal"]');
  await block.getByRole('button', { name: 'Copier Terminal' }).click();
  await expect(block.getByRole('status')).toHaveText('Copié');
  await expect(block.getByRole('button', { name: 'Copier Terminal' })).toContainText('Copié');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('pnpm add @cristal/react');
  await expect(block.getByRole('button')).toContainText('Copier', { timeout: 4000 });
});
