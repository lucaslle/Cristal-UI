import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const dash = (page: Page) => page.locator('cr-grid-layout');
const widget = (page: Page, id: string) => page.locator(`cr-grid-item#${id}`);
const area = (page: Page, id: string) => widget(page, id).evaluate((el) => `${(el as HTMLElement).style.gridColumn} | ${(el as HTMLElement).style.gridRow}`);
const status = (page: Page) => dash(page).locator('[role="status"]');
const pick = (page: Page, setting: string, option: string) => page.getByRole('radiogroup', { name: setting }).getByRole('radio', { name: option, exact: true }).click();
/** Appuie à (x, y), glisse jusqu'à (x + dx, y + dy) et relâche. */
const dragBy = async (page: Page, x: number, y: number, dx: number, dy: number) => {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 10 });
  await page.mouse.up();
};

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
  const widths = await page.locator('cr-grid-item').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
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

test('by default, pressing anywhere on a card and moving drags it at once', async ({ page }) => {
  await expect(dash(page)).toHaveAttribute('grab', 'surface');
  expect(await widget(page, 'revenus').getByText('48 920 €').evaluate((el) => getComputedStyle(el).cursor)).toBe('grab');
  const box = (await widget(page, 'revenus').getByText('48 920 €').boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 20, { steps: 5 });
  await expect(widget(page, 'revenus')).toHaveAttribute('data-lifted', '');
  await page.mouse.move(box.x + 330, box.y + 30, { steps: 5 });
  await page.mouse.up();
  expect(await area(page, 'revenus')).toBe('4 / span 4 | 1 / span 2');
  expect(await page.evaluate(() => getSelection()?.toString())).toBe('');
});

test('grab="handle": the card surface does not drag, the handle still does', async ({ page }) => {
  await pick(page, 'Attraper', 'handle');
  await expect(dash(page)).toHaveAttribute('grab', 'handle');
  expect(await widget(page, 'revenus').getByText('48 920 €').evaluate((el) => getComputedStyle(el).cursor)).toBe('auto');
  const box = (await widget(page, 'revenus').getByText('48 920 €').boundingBox())!;
  await dragBy(page, box.x + 20, box.y + 10, 310, 20);
  expect(await area(page, 'revenus')).toBe('1 / span 4 | 1 / span 2');
  const handle = (await dash(page).getByRole('button', { name: 'Déplacer Revenus' }).boundingBox())!;
  await dragBy(page, handle.x + 10, handle.y + 10, 320, 20);
  expect(await area(page, 'revenus')).toBe('4 / span 4 | 1 / span 2');
});

test('resize-handle="edges": the right edge changes the width only, the bottom edge the height only', async ({ page }) => {
  await pick(page, 'Agrandir', 'edges');
  const item = widget(page, 'revenus');
  await expect(item.locator('.resize')).toHaveCount(3);
  const right = (await item.locator('.resize-x').boundingBox())!;
  await dragBy(page, right.x + right.width / 2, right.y + right.height / 2, 200, 120);
  expect(await area(page, 'revenus')).toBe('1 / span 6 | 1 / span 2');
  const bottom = (await item.locator('.resize-y').boundingBox())!;
  await dragBy(page, bottom.x + bottom.width / 2, bottom.y + bottom.height / 2, 200, 100);
  expect(await area(page, 'revenus')).toBe('1 / span 6 | 1 / span 3');
});

test('the knob and the corner arc resize in both directions', async ({ page }) => {
  for (const handle of ['knob', 'corner']) {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await pick(page, 'Agrandir', handle);
    await expect(widget(page, 'revenus')).toHaveAttribute('resize-handle', handle);
    const corner = (await widget(page, 'revenus').locator('.resize').boundingBox())!;
    expect(corner.width).toBeGreaterThanOrEqual(24);
    await dragBy(page, corner.x + 12, corner.y + 12, 120, 100);
    expect(await area(page, 'revenus')).toBe('1 / span 5 | 1 / span 3');
  }
});

for (const variant of ['card', 'elevated', 'soft', 'outline', 'glass']) {
  test(`variant ${variant} keeps the grid accessible and draggable`, async ({ page }) => {
    await pick(page, 'Apparence', variant);
    await expect(widget(page, 'revenus')).toHaveAttribute('variant', variant);
    expect((await new AxeBuilder({ page }).include('cr-grid-layout').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
    const box = (await widget(page, 'revenus').getByText('48 920 €').boundingBox())!;
    await dragBy(page, box.x + 20, box.y + 10, 320, 20);
    expect(await area(page, 'revenus')).toBe('4 / span 4 | 1 / span 2');
  });
}

test('grab="hold": holding the click anywhere on a card lifts it, then it follows the pointer', async ({ page }) => {
  await pick(page, 'Attraper', 'hold');
  const value = widget(page, 'revenus').getByText('48 920 €');
  const box = (await value.boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 10);
  await page.mouse.down();
  await page.waitForTimeout(400);
  await expect(widget(page, 'revenus')).toHaveAttribute('data-lifted', '');
  await page.mouse.move(box.x + 330, box.y + 30, { steps: 10 });
  await page.mouse.up();
  await expect(widget(page, 'revenus')).not.toHaveAttribute('data-lifted', '');
  expect(await area(page, 'revenus')).toBe('4 / span 4 | 1 / span 2');
  expect(await page.evaluate(() => getSelection()?.toString())).toBe('');
});

test('grab="hold": a quick press and move does not drag the card (text stays selectable)', async ({ page }) => {
  await pick(page, 'Attraper', 'hold');
  const value = widget(page, 'revenus').getByText('48 920 €');
  const box = (await value.boundingBox())!;
  await page.mouse.move(box.x + 2, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 300, box.y + 10, { steps: 6 });
  await page.waitForTimeout(400);
  await page.mouse.up();
  await expect(widget(page, 'revenus')).not.toHaveAttribute('data-lifted', '');
  expect(await area(page, 'revenus')).toBe('1 / span 4 | 1 / span 2');
});

test('holding the click on a control inside the card does not lift it', async ({ page }) => {
  const checkbox = widget(page, 'taches').getByRole('checkbox').last();
  const box = (await checkbox.boundingBox())!;
  await page.mouse.move(box.x + 5, box.y + 5);
  await page.mouse.down();
  await page.waitForTimeout(400);
  await expect(widget(page, 'taches')).not.toHaveAttribute('data-lifted', '');
  await page.mouse.up();
  await expect(checkbox).toBeChecked();
});
