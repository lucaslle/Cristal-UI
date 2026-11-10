import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const volume = (page: Page) => page.getByRole('slider', { name: 'Volume' });
const host = (page: Page) => page.locator('cr-slider[name="volume"]');
const bubble = (page: Page) => host(page).locator('.bubble');
const scale = (page: Page) => bubble(page).evaluate((el) => getComputedStyle(el).scale);

test('a labelled native slider that the keyboard moves, reported to React and the form', async ({ page }) => {
  await expect(volume(page)).toHaveValue('40');
  await expect(volume(page)).toHaveAttribute('max', '100');
  await expect(bubble(page)).toHaveText('40');
  await volume(page).focus();
  await page.keyboard.press('ArrowRight');
  await expect(volume(page)).toHaveValue('45');
  await expect(page.getByTestId('slider-value')).toHaveText('45');
  await page.keyboard.press('End');
  await expect(page.getByTestId('slider-value')).toHaveText('100');
  await page.keyboard.press('Home');
  await expect(bubble(page)).toHaveText('0');
  expect(await page.getByTestId('slider-form').evaluate((form) => new FormData(form as HTMLFormElement).get('volume'))).toBe('0');
});

test('keyboard focus grows the bubble', async ({ page }) => {
  expect(await scale(page)).toBe('0.85');
  await volume(page).focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(volume(page)).toBeFocused();
  await expect.poll(() => scale(page)).toBe('1');
  expect(await volume(page).evaluate((el) => el.matches(':focus-visible'))).toBe(true);
});

test('dragging moves the value, the filled track and the bubble with the thumb', async ({ page }) => {
  await volume(page).scrollIntoViewIfNeeded();
  const box = (await volume(page).boundingBox())!;
  const thumbX = (value: number) => box.x + 10 + (value / 100) * (box.width - 20);
  await page.mouse.move(thumbX(40), box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(thumbX(80), box.y + box.height / 2, { steps: 5 });
  await expect(page.getByTestId('slider-value')).toHaveText('80');
  await expect.poll(() => scale(page)).toBe('1');
  await page.waitForTimeout(400);
  const bubbleBox = (await bubble(page).boundingBox())!;
  expect(Math.abs(bubbleBox.x + bubbleBox.width / 2 - thumbX(80))).toBeLessThan(2);
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await volume(page).blur();
  await expect.poll(() => scale(page)).toBe('0.85');
  expect(await host(page).locator('.slider').evaluate((el) => getComputedStyle(el).getPropertyValue('--ratio'))).toBe('0.8');
});

test('a disabled slider cannot be moved', async ({ page }) => {
  const light = page.getByRole('slider', { name: 'Luminosité' });
  await expect(light).toBeDisabled();
  await expect(light).toHaveValue('70');
});
