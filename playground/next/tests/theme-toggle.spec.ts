import { expect, test, type Page } from '@playwright/test';

const transitions = ['circle', 'curtain', 'blinds', 'flip', 'eclipse', 'sweep', 'none'];
const toggle = (page: Page) => page.getByRole('button', { name: 'Thème sombre' });
const theme = (page: Page) => page.evaluate(() => document.documentElement.dataset.theme);
const errorsOf = (page: Page) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};
// Compte les transitions de vue lancées et les animations jouées sur leurs images.
const countViewTransitions = (page: Page) =>
  page.addInitScript(() => {
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    Object.assign(window, { viewTransitions: 0, viewTransitionAnimations: 0 });
    document.startViewTransition = ((update: () => void) => {
      (window as unknown as { viewTransitions: number }).viewTransitions++;
      const transition = start(update);
      transition.ready.then(() => {
        const played = document.getAnimations().filter((animation) => String((animation.effect as KeyframeEffect).pseudoElement).includes('view-transition-new'));
        (window as unknown as { viewTransitionAnimations: number }).viewTransitionAnimations += played.length;
      });
      return transition;
    }) as typeof document.startViewTransition;
  });
const counts = (page: Page) => page.evaluate(() => ({ started: (window as unknown as { viewTransitions: number }).viewTransitions, animated: (window as unknown as { viewTransitionAnimations: number }).viewTransitionAnimations }));

test.afterEach(async ({ page }) => {
  await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
});

test('hydrates without console errors and starts in the light theme', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('/');
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('a click switches data-theme on <html>, aria-pressed and crChange, and the components change colour', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Secondaire', exact: true });
  const colours = () => Promise.all([page.evaluate(() => getComputedStyle(document.body).backgroundColor), button.evaluate((el) => getComputedStyle(el).backgroundColor)]);
  await page.getByRole('radio', { name: 'none', exact: true }).click();
  const light = await colours();
  await toggle(page).click();
  await expect.poll(() => theme(page)).toBe('dark');
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('theme-event')).toHaveText('dark');
  await page.waitForTimeout(400);
  const dark = await colours();
  expect(dark[0]).not.toBe(light[0]);
  expect(dark[1]).not.toBe(light[1]);
  await toggle(page).click();
  await expect.poll(() => theme(page)).toBe('light');
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('theme-event')).toHaveText('light');
});

for (const transition of transitions) {
  test(`transition ${transition} switches the theme without errors`, async ({ page }) => {
    const errors = errorsOf(page);
    await countViewTransitions(page);
    await page.goto('/');
    await page.getByRole('radio', { name: transition, exact: true }).click();
    await expect(page.locator('cr-theme-toggle')).toHaveAttribute('transition', transition);
    await toggle(page).click();
    await expect.poll(() => theme(page)).toBe('dark');
    await page.waitForTimeout(1400);
    await toggle(page).click();
    await expect.poll(() => theme(page)).toBe('light');
    await page.waitForTimeout(1400);
    const supported = await page.evaluate(() => 'startViewTransition' in document);
    if (supported) expect(await counts(page)).toEqual(transition === 'none' ? { started: 0, animated: 0 } : { started: 2, animated: expect.any(Number) });
    if (supported && transition !== 'none') expect((await counts(page)).animated).toBeGreaterThanOrEqual(2);
    expect(errors).toEqual([]);
  });
}

test('reduced motion switches instantly, without a view transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await countViewTransitions(page);
  await page.goto('/');
  await toggle(page).click();
  await expect.poll(() => theme(page)).toBe('dark');
  expect((await counts(page)).started ?? 0).toBe(0);
  const morph = await page.locator('cr-theme-toggle').evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.disc')!).transitionDuration);
  expect(morph).toBe('0s');
});

test('the initial state follows data-theme, and later changes made elsewhere', async ({ page }) => {
  await page.goto('/');
  const pressed = await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
    const element = document.createElement('cr-theme-toggle');
    document.body.append(element);
    return customElements.whenDefined('cr-theme-toggle').then(() => new Promise((resolve) => setTimeout(() => resolve(element.shadowRoot!.querySelector('button')!.getAttribute('aria-pressed')), 300)));
  });
  expect(pressed).toBe('true');
  await expect(toggle(page).first()).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
  await expect(toggle(page).first()).toHaveAttribute('aria-pressed', 'false');
});

test('without data-theme, the initial state follows the system preference', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('cr-theme-toggle')).toHaveAttribute('theme', 'dark');
  await page.getByRole('radio', { name: 'none', exact: true }).click();
  await toggle(page).click();
  await expect.poll(() => theme(page)).toBe('light');
});

test('Enter and Space toggle the theme from the keyboard, with a visible focus', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('radio', { name: 'none', exact: true }).click();
  await toggle(page).focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(toggle(page)).toBeFocused();
  const outline = await page.locator('cr-theme-toggle').evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('button')!).outlineStyle);
  expect(outline).toBe('solid');
  await page.keyboard.press('Enter');
  await expect.poll(() => theme(page)).toBe('dark');
  await page.keyboard.press('Space');
  await expect.poll(() => theme(page)).toBe('light');
  const size = await toggle(page).boundingBox();
  expect(size!.width).toBeGreaterThanOrEqual(40);
});
