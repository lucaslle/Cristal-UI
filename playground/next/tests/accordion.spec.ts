import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

type Page = import('@playwright/test').Page;
const header = (page: Page, name: string | RegExp) => page.getByRole('button', { name });
const item = (page: Page, name: string | RegExp) => page.locator('cr-accordion-item', { has: header(page, name) });

test('rendered on the server, follows the APG accordion pattern and keeps one section open', async ({ page }) => {
  const delivery = header(page, '01 Livraison');
  const returns = header(page, '02 Retours');
  await expect(delivery).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('region', { name: '01 Livraison' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: '01 Livraison' })).toBeVisible();
  await returns.click();
  await expect(returns).toHaveAttribute('aria-expanded', 'true');
  await expect(delivery).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('region', { name: '01 Livraison' })).toBeHidden();
});

test('arrow keys, Home and End move between headers', async ({ page }) => {
  await header(page, 'Présentation').focus();
  await page.keyboard.press('ArrowDown');
  await expect(header(page, 'Ingrédients')).toBeFocused();
  await page.keyboard.press('End');
  await expect(header(page, 'Étapes')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(header(page, 'Présentation')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(header(page, 'Étapes')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(header(page, 'Étapes')).toHaveAttribute('aria-expanded', 'true');
});

test('expand all opens the sections one after another, then closes them in reverse', async ({ page }) => {
  await page.getByRole('button', { name: 'Tout ouvrir' }).click();
  const names = ['Présentation', 'Ingrédients', 'Étapes'];
  const handles = await Promise.all(names.map((name) => item(page, name).elementHandle()));
  const openedAt = await page.evaluate(
    (items) =>
      new Promise<number[]>((resolve) => {
        const times = items.map(() => 0);
        const start = performance.now();
        const tick = () => {
          items.forEach((item, i) => !times[i] && item.hasAttribute('open') && (times[i] = performance.now() - start || 1));
          times.every(Boolean) ? resolve(times) : requestAnimationFrame(tick);
        };
        tick();
      }),
    handles,
  );
  expect(openedAt[1]).toBeGreaterThanOrEqual(openedAt[0]);
  expect(openedAt[2]).toBeGreaterThanOrEqual(openedAt[1]);
  expect(openedAt[2]).toBeGreaterThan(openedAt[0] + 100);
  await page.getByRole('button', { name: 'Tout fermer' }).click();
  for (const name of names) await expect(header(page, name)).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: 'Tout ouvrir' })).toBeVisible();
});

test('panels: the chosen panel widens, the others fold and the open one stays open', async ({ page }) => {
  const peaks = header(page, 'Sommets');
  await expect(peaks).toHaveAttribute('aria-expanded', 'true');
  await header(page, 'Côte').click();
  await expect(header(page, 'Côte')).toHaveAttribute('aria-expanded', 'true');
  await expect(peaks).toHaveAttribute('aria-expanded', 'false');
  await page.waitForTimeout(700);
  expect(await item(page, 'Côte').evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.header')!).cursor)).toBe('default');
  const width = (label: string) => item(page, label).evaluate((el) => el.getBoundingClientRect().width);
  expect(await width('Côte')).toBeGreaterThan((await width('Sommets')) * 2);
  await header(page, 'Côte').click();
  await expect(header(page, 'Côte')).toHaveAttribute('aria-expanded', 'true');
  await header(page, 'Côte').focus();
  await page.keyboard.press('ArrowRight');
  await expect(header(page, 'Prairie')).toBeFocused();
});

test('panels: the first panel is open on load without moving', async ({ page }) => {
  const sizes = await item(page, 'Sommets').evaluate(
    (el) =>
      new Promise<number[]>((resolve) => {
        const list: number[] = [];
        const tick = () => (list.push(Math.round(el.getBoundingClientRect().width)), list.length < 20 ? requestAnimationFrame(tick) : resolve(list));
        tick();
      }),
  );
  expect(new Set(sizes).size).toBe(1);
});

test('accent bar grows on the open section', async ({ page }) => {
  await header(page, /Développement/).click();
  await page.waitForTimeout(600);
  const bar = await page
    .locator('cr-accordion-item', { has: header(page, /Développement/) })
    .evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.item')!, '::before').transform);
  expect(bar).toBe('matrix(1, 0, 0, 1, 0, 0)');
});

test('cascade: amounts count up to their final text and bars grow', async ({ page }) => {
  await header(page, /Total/).click();
  const amount = page.locator('[data-cr-count="99"]');
  await expect(amount).not.toHaveText('99,00 €');
  await expect(amount).toHaveText('99,00 €');
  await header(page, /Vues cette semaine/).click();
  const bar = page.locator('[data-cr-grow]').first();
  expect(await bar.evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
});

test('reduced motion opens instantly, without cascade', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await header(page, /Total/).click();
  await expect(page.locator('[data-cr-count="99"]')).toHaveText('99,00 €');
  expect(await item(page, /Total/).evaluate((el) => el.shadowRoot!.querySelector('.panel')!.getAnimations().length)).toBe(0);
});
