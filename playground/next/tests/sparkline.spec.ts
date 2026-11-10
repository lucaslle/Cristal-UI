import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

const sales = (page: Page) => page.getByTestId('sparkline-sales');

/** Relève le tracé à chaque image pendant 700 ms après le clic. */
const pathsAfterClick = (page: Page) =>
  sales(page).evaluate(async (el) => {
    const seen: string[] = [];
    const end = performance.now() + 700;
    await new Promise<void>((resolve) => {
      const tick = () => {
        seen.push(el.shadowRoot!.querySelector('.line')!.getAttribute('d')!);
        if (performance.now() < end) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    return [...new Set(seen)];
  });

test('a sparkline is an image named by its label and a summary of its values', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: 'Ventes de la semaine : dernière valeur 41, minimum 12, maximum 41, en hausse' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Visites : dernière valeur 3, minimum 3, maximum 3, stable' })).toBeVisible();
  await page.getByRole('button', { name: 'Changer de semaine' }).click();
  await expect(sales(page).getByRole('img')).toHaveAccessibleName('Ventes de la semaine : dernière valeur 14, minimum 9, maximum 40, en baisse');
});

test('the line draws itself, then morphs point by point to new values', async ({ page }) => {
  await page.goto('/');
  expect(await sales(page).evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.line')!).animationName)).toBe('cr-sparkline-draw');
  const [paths] = await Promise.all([pathsAfterClick(page), page.getByRole('button', { name: 'Changer de semaine' }).click()]);
  expect(paths.length).toBeGreaterThan(4);
  expect(paths[paths.length - 1].match(/[ML]/g)).toHaveLength(7);
});

test('with reduced motion there is no drawing and no morph', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await sales(page).evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.line')!).animationName)).toBe('none');
  const [paths] = await Promise.all([pathsAfterClick(page), page.getByRole('button', { name: 'Changer de semaine' }).click()]);
  expect(paths.length).toBeLessThanOrEqual(2);
});

test('the area variant fills under the line, and follows its size', async ({ page }) => {
  await page.goto('/');
  const visits = page.getByTestId('sparkline-visits');
  await expect(visits.locator('.area')).toHaveCount(1);
  await expect.poll(() => visits.evaluate((el) => el.shadowRoot!.querySelector('svg')!.getAttribute('viewBox'))).toBe('0 0 160 40');
});
