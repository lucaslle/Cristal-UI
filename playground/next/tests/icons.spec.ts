import { expect, test, type Locator } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const box = (locator: Locator) => locator.evaluate((el) => [el.getBoundingClientRect().width, el.getBoundingClientRect().height]);
const stroke = (locator: Locator) => locator.evaluate((el) => getComputedStyle(el.querySelector('path') ?? el.shadowRoot!.querySelector('path')!).stroke);

test('icons are in the server HTML, decorative by default, 24 px and in the text colour', async ({ page, request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('aria-label="Favori"');
  const icon = page.getByTestId('icon-default');
  await expect(icon).toHaveAttribute('aria-hidden', 'true');
  expect(await box(icon)).toEqual([24, 24]);
  expect(await stroke(icon)).toBe('rgb(30, 27, 46)');
});

test('size, color and label: a named image at the chosen size and colour', async ({ page }) => {
  const heart = page.getByRole('img', { name: 'Favori' });
  await expect(heart).toBeVisible();
  expect(await box(heart)).toEqual([32, 32]);
  expect(await stroke(heart)).toBe('rgb(225, 29, 72)');
});

test('--cr-icon-size on a container sizes the icons inside, which follow its text colour', async ({ page }) => {
  const star = page.getByTestId('icon-variable');
  expect(await box(star)).toEqual([40, 40]);
  expect(await stroke(star)).toBe('rgb(5, 150, 105)');
});

test('HTML elements take the same size, color and label attributes', async ({ page }) => {
  const bell = page.getByRole('img', { name: 'Notifications' });
  await expect(bell).toBeVisible();
  expect(await box(bell)).toEqual([20, 20]);
  const trash = page.getByTestId('icon-element');
  await expect(trash).toHaveAttribute('aria-hidden', 'true');
  expect(await box(trash)).toEqual([24, 24]);
  expect(await stroke(trash)).toBe('rgb(220, 38, 38)');
  await trash.evaluate((el) => el.setAttribute('size', '1.5rem'));
  expect(await box(trash)).toEqual([24, 24]);
  await trash.evaluate((el) => el.setAttribute('size', '48'));
  expect(await box(trash)).toEqual([48, 48]);
});
