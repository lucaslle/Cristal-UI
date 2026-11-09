import { expect, test, type Page } from '@playwright/test';

const dash = (page: Page) => page.locator('cr-dashboard');
const widget = (page: Page, id: string) => page.locator(`cr-widget#${id}`);
const area = (page: Page, id: string) => widget(page, id).evaluate((el) => `${(el as HTMLElement).style.gridColumn} | ${(el as HTMLElement).style.gridRow}`);
const status = (page: Page) => dash(page).locator('[role="status"]');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await dash(page).scrollIntoViewIfNeeded();
  await expect.poll(() => area(page, 'revenus')).toBe('1 / span 4 | 1 / span 2');
});

test('places widgets on the grid and names them', async ({ page }) => {
  await expect(dash(page).getByRole('group', { name: "Panneau d'opérations" })).toBeVisible();
  await expect(widget(page, 'conversion')).toHaveAttribute('aria-label', 'Conversion');
  expect(await area(page, 'conversion')).toBe('10 / span 3 | 1 / span 2');
});

test('keyboard: arrows move, Shift + arrows resize, others make room, each change is announced', async ({ page }) => {
  const handle = dash(page).getByRole('button', { name: 'Déplacer Revenus' });
  await handle.focus();
  await page.keyboard.press('ArrowRight');
  await expect(status(page)).toHaveText('Revenus : colonne 2, ligne 1.');
  expect(await area(page, 'revenus')).toBe('2 / span 4 | 1 / span 2');
  await page.keyboard.press('Shift+ArrowDown');
  await expect(status(page)).toHaveText('Revenus : 4 colonnes sur 3 lignes.');
  expect(await area(page, 'revenus')).toBe('2 / span 4 | 1 / span 3');
  expect(await area(page, 'visites')).toBe('1 / span 5 | 4 / span 2');
  await expect(handle).toBeFocused();
});

test('mouse: dragging the handle moves the widget and pushes the others away', async ({ page }) => {
  const handle = dash(page).getByRole('button', { name: 'Déplacer Revenus' });
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 30, { steps: 6 });
  await expect(widget(page, 'revenus')).toHaveAttribute('data-lifted', '');
  await expect(dash(page).locator('.ghost')).toBeVisible();
  await page.mouse.move(box.x + 330, box.y + 30, { steps: 6 });
  await page.mouse.up();
  await expect(widget(page, 'revenus')).not.toHaveAttribute('data-lifted', '');
  expect(await area(page, 'revenus')).toBe('4 / span 4 | 1 / span 2');
  expect(await area(page, 'taches')).toBe('6 / span 4 | 3 / span 2');
  await expect(page.getByTestId('dashboard-layout')).toContainText('{"id":"revenus","x":3,"y":0,"w":4,"h":2}');
});

test('mouse: dragging the corner resizes the widget', async ({ page }) => {
  const corner = widget(page, 'conversion').locator('.resize');
  const box = (await corner.boundingBox())!;
  await page.mouse.move(box.x + 8, box.y + 8);
  await page.mouse.down();
  await page.mouse.move(box.x + 8, box.y + 200, { steps: 8 });
  await page.mouse.up();
  expect(await area(page, 'conversion')).toBe('10 / span 3 | 1 / span 4');
});

test('added widgets take the first free spot and can be removed', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter « Latence »' }).click();
  await expect.poll(() => area(page, 'latence')).toBe('6 / span 3 | 3 / span 2');
  await dash(page).getByRole('button', { name: 'Retirer Latence' }).click();
  await expect(widget(page, 'latence')).toHaveCount(0);
});

test('the layout is kept on reload and Restaurer brings back the original', async ({ page }) => {
  await dash(page).getByRole('button', { name: 'Déplacer Revenus' }).focus();
  await page.keyboard.press('ArrowRight');
  await page.reload();
  await dash(page).scrollIntoViewIfNeeded();
  await expect.poll(() => area(page, 'revenus')).toBe('2 / span 4 | 1 / span 2');
  await page.getByRole('button', { name: 'Restaurer' }).click();
  await expect.poll(() => area(page, 'revenus')).toBe('1 / span 4 | 1 / span 2');
  await expect(status(page)).toHaveText('Disposition d’origine rétablie.');
});

test('on a narrow screen widgets stack full width, without handles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(widget(page, 'revenus')).not.toHaveAttribute('data-editable', '');
  const widths = await page.locator('cr-widget').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
  expect(new Set(widths).size).toBe(1);
});

test('others slide into place, except with reduced motion', async ({ page }) => {
  await dash(page).getByRole('button', { name: 'Déplacer Revenus' }).focus();
  await page.keyboard.press('Shift+ArrowDown');
  expect(await widget(page, 'visites').evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(400);
  await page.keyboard.press('Shift+ArrowDown');
  expect(await widget(page, 'visites').evaluate((el) => el.getAnimations().length)).toBe(0);
});
