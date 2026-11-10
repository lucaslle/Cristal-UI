import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const group = (page: Page) => page.getByRole('radiogroup', { name: 'Note du produit' });
const star = (page: Page, name: string) => group(page).getByRole('radio', { name, exact: true });
const fills = (page: Page) =>
  page.locator('cr-rating[name="note"]').evaluate((el) => Array.from(el.shadowRoot!.querySelectorAll('.icon path'), (path) => getComputedStyle(path).fill));
const PRIMARY = 'rgb(109, 40, 217)';
const EMPTY = 'rgba(0, 0, 0, 0)';

test('a radio group of stars named "N étoiles sur 5", a single Tab stop on the chosen one', async ({ page }) => {
  await expect(group(page).getByRole('radio')).toHaveCount(5);
  await expect(star(page, '1 étoile sur 5')).toBeVisible();
  await expect(star(page, '3 étoiles sur 5')).toBeChecked();
  await expect(star(page, '3 étoiles sur 5')).toHaveAttribute('tabindex', '0');
  await expect(star(page, '4 étoiles sur 5')).toHaveAttribute('tabindex', '-1');
  await expect.poll(() => fills(page)).toEqual([PRIMARY, PRIMARY, PRIMARY, EMPTY, EMPTY]);
});

test('arrow keys, Home and End change the rating, wrap around, and reach React and the form', async ({ page }) => {
  await star(page, '3 étoiles sur 5').focus();
  await page.keyboard.press('ArrowRight');
  await expect(star(page, '4 étoiles sur 5')).toBeChecked();
  await expect(star(page, '4 étoiles sur 5')).toBeFocused();
  await expect(page.getByTestId('rating-value')).toHaveText('4');
  await page.keyboard.press('End');
  await expect(star(page, '5 étoiles sur 5')).toBeChecked();
  await page.keyboard.press('ArrowUp');
  await expect(star(page, '1 étoile sur 5')).toBeChecked();
  await page.keyboard.press('ArrowLeft');
  await expect(star(page, '5 étoiles sur 5')).toBeChecked();
  await page.keyboard.press('Home');
  await expect(star(page, '1 étoile sur 5')).toBeChecked();
  await expect.poll(() => fills(page)).toEqual([PRIMARY, EMPTY, EMPTY, EMPTY, EMPTY]);
  expect(await page.getByTestId('rating-form').evaluate((form) => new FormData(form as HTMLFormElement).get('note'))).toBe('1');
});

test('the stars fill in a wave up to the chosen one, and hovering previews a rating', async ({ page }) => {
  const delays = await page.locator('cr-rating[name="note"]').evaluate((el) => Array.from(el.shadowRoot!.querySelectorAll('.icon path'), (path) => getComputedStyle(path).transitionDelay));
  expect(delays.map((delay) => delay.split(',')[0])).toEqual(['0s', '0.06s', '0.12s', '0.18s', '0.24s']);
  await star(page, '5 étoiles sur 5').hover();
  await expect.poll(() => fills(page)).toEqual([PRIMARY, PRIMARY, PRIMARY, PRIMARY, PRIMARY]);
  await star(page, '2 étoiles sur 5').hover();
  await expect.poll(() => fills(page)).toEqual([PRIMARY, PRIMARY, EMPTY, EMPTY, EMPTY]);
  await star(page, '2 étoiles sur 5').click();
  await expect(page.getByTestId('rating-value')).toHaveText('2');
  await page.mouse.move(0, 0);
  await expect.poll(() => fills(page)).toEqual([PRIMARY, PRIMARY, EMPTY, EMPTY, EMPTY]);
});

test('a read-only rating is an image named by its value, a disabled one cannot change', async ({ page }) => {
  await expect(page.getByRole('img', { name: 'Note moyenne : 4 sur 5' })).toBeVisible();
  await expect(page.locator('cr-rating[readonly]').getByRole('radio')).toHaveCount(0);
  const locked = page.getByRole('radiogroup', { name: 'Note de la commande' });
  await expect(locked.getByRole('radio', { name: '2 étoiles sur 5' })).toBeChecked();
  await expect(locked.getByRole('radio', { name: '2 étoiles sur 5' })).toBeDisabled();
});
