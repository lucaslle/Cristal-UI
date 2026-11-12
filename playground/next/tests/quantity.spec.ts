import { expect, test, type Page } from '@playwright/test';

const animations = ['press', 'slide', 'ripple', 'stretch', 'spin', 'halo'];
const demo = (page: Page, id: string) => page.getByTestId(`quantity-${id}`);
const plus = (page: Page, id: string) => demo(page, id).getByRole('button', { name: `Augmenter Quantité (${id})` });
const minus = (page: Page, id: string) => demo(page, id).getByRole('button', { name: `Diminuer Quantité (${id})` });
const spin = (page: Page, id: string) => demo(page, id).getByRole('spinbutton', { name: `Quantité (${id})` });
const form = (page: Page) => page.getByTestId('quantity-form');
const mugs = (page: Page) => form(page).getByRole('spinbutton', { name: 'Mugs' });

// Animations du pas en cours dans le composant (les cr-q-*).
const running = (page: Page, id: string) =>
  demo(page, id)
    .locator('cr-quantity')
    .evaluate((el) =>
      el
        .shadowRoot!.getAnimations()
        .map((a) => (a as CSSAnimation).animationName)
        .filter((name) => name?.startsWith('cr-q-')),
    );

const errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await demo(page, 'press').scrollIntoViewIfNeeded();
});

test.afterEach(() => expect(errors).toEqual([]));

test('quantity: the buttons change the value by one step and fire crInput and crChange', async ({ page }) => {
  await expect(spin(page, 'press')).toHaveValue('2');
  await plus(page, 'press').click();
  await expect(spin(page, 'press')).toHaveValue('3');
  await expect(spin(page, 'press')).toHaveAttribute('aria-valuenow', '3');
  await expect(demo(page, 'press').getByText('input 3 · change 3')).toBeVisible();
  await minus(page, 'press').click();
  await minus(page, 'press').click();
  await expect(spin(page, 'press')).toHaveValue('1');
  await expect(demo(page, 'press').getByText('input 1 · change 1')).toBeVisible();
});

test('quantity: at a bound the button is aria-disabled, does nothing and keeps the focus', async ({ page }) => {
  for (let i = 0; i < 3; i++) await plus(page, 'press').click();
  await expect(spin(page, 'press')).toHaveValue('5');
  await expect(plus(page, 'press')).toHaveAttribute('aria-disabled', 'true');
  await expect(plus(page, 'press')).not.toHaveAttribute('disabled');
  await expect(plus(page, 'press')).toBeFocused();
  // force : Playwright attend qu'un bouton aria-disabled redevienne actif avant de cliquer.
  await plus(page, 'press').click({ force: true });
  await page.keyboard.press('Enter');
  await expect(spin(page, 'press')).toHaveValue('5');
  await expect(plus(page, 'press')).toBeFocused();

  await minus(page, 'slide').click();
  await minus(page, 'slide').click();
  await expect(spin(page, 'slide')).toHaveValue('0');
  await expect(minus(page, 'slide')).toHaveAttribute('aria-disabled', 'true');
  await expect(minus(page, 'slide')).toBeFocused();
  await expect(plus(page, 'slide')).not.toHaveAttribute('aria-disabled');
});

test('quantity: the spinbutton follows the APG keys', async ({ page }) => {
  const field = spin(page, 'slide');
  await expect(field).toHaveAttribute('aria-valuemin', '0');
  await expect(field).toHaveAttribute('aria-valuemax', '5');
  await field.focus();
  const expectations: [string, string][] = [
    ['ArrowUp', '3'],
    ['ArrowDown', '2'],
    ['PageUp', '5'],
    ['PageDown', '0'],
    ['End', '5'],
    ['Home', '0'],
  ];
  for (const [key, value] of expectations) {
    await field.press(key);
    await expect(field).toHaveValue(value);
    await expect(field).toHaveAttribute('aria-valuenow', value);
  }
  await expect(demo(page, 'slide').getByText('input 0 · change 0')).toBeVisible();
});

test('quantity: a typed number is committed on blur, clamped to the bounds', async ({ page }) => {
  const field = spin(page, 'ripple');
  await field.fill('9');
  await expect(demo(page, 'ripple').getByText('input 9')).toBeVisible();
  await field.press('Tab');
  await expect(field).toHaveValue('5');
  await expect(demo(page, 'ripple').getByText('input 5 · change 5')).toBeVisible();
  await field.fill('abc');
  await field.press('Enter');
  await expect(field).toHaveValue('5');
});

test('quantity: off-step and empty values show translated messages and block the form', async ({ page }) => {
  await mugs(page).fill('5');
  await mugs(page).press('Tab');
  await expect(form(page).getByText('Choisissez 4 ou 6 (par pas de 2).')).toBeVisible();
  await expect(mugs(page)).toHaveAttribute('aria-invalid', 'true');
  await mugs(page).fill('');
  await form(page).getByRole('button', { name: 'Ajouter au panier' }).click();
  await expect(form(page).getByText('Ce champ est obligatoire.')).toBeVisible();
  await expect(mugs(page)).toBeFocused();
  await expect(form(page).getByText('Envoyé')).toHaveCount(0);
  await form(page).locator('cr-quantity').evaluate((el: HTMLElement & { value?: number }) => (el.value = 12));
  await form(page).getByRole('button', { name: 'Ajouter au panier' }).click();
  await expect(form(page).getByText('Choisissez une valeur entre 2 et 10.')).toBeVisible();
});

test('quantity: the form sends the value and reset restores it', async ({ page }) => {
  await form(page).getByRole('button', { name: 'Augmenter Mugs' }).click();
  await form(page).getByRole('button', { name: 'Augmenter Mugs' }).click();
  await expect(mugs(page)).toHaveValue('6');
  await form(page).getByRole('button', { name: 'Ajouter au panier' }).click();
  await expect(form(page).getByText('Envoyé : 6 mugs.')).toBeVisible();
  await form(page).getByRole('button', { name: 'Revenir à 2 mugs' }).click();
  await expect(mugs(page)).toHaveValue('2');
  await expect(form(page).getByRole('button', { name: 'Diminuer Mugs' })).toHaveAttribute('aria-disabled', 'true');
});

test('quantity: button changes are announced, spinbutton keys are not', async ({ page }) => {
  const status = demo(page, 'halo').locator('cr-quantity [role="status"]');
  await plus(page, 'halo').click();
  await expect(status).toHaveText('3');
  await spin(page, 'halo').press('ArrowUp');
  await expect(spin(page, 'halo')).toHaveValue('4');
  await expect(status).toHaveText('');
  await minus(page, 'halo').click();
  await expect(status).toHaveText('3');
});

for (const animation of animations) {
  test(`quantity ${animation}: the attribute reflects and a click and an arrow key both animate`, async ({ page }) => {
    await expect(demo(page, animation).locator('cr-quantity')).toHaveAttribute('animation', animation);
    expect(await running(page, animation)).toEqual([]);
    await plus(page, animation).click();
    await expect.poll(() => running(page, animation)).not.toEqual([]);
    await page.waitForTimeout(900);
    await spin(page, animation).press('ArrowDown');
    await expect.poll(() => running(page, animation)).not.toEqual([]);
    await expect(spin(page, animation)).toHaveValue('2');
  });
}

test('quantity: with reduced motion, no variant animates', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const animation of animations) {
    await plus(page, animation).click();
    await expect(spin(page, animation)).toHaveValue('3');
    expect(await running(page, animation)).toEqual([]);
    await spin(page, animation).press('ArrowDown');
    expect(await running(page, animation)).toEqual([]);
  }
});
