import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

const animations = ['roll', 'flap', 'blur', 'stagger', 'decode', 'count'];
// Espace fine insécable : le séparateur de milliers en français.
const fr = (text: string) => text.replace(' ', ' ');

const number = (page: Page, id: string) => page.getByTestId(`number-${id}`);
const change = (page: Page) => page.getByRole('button', { name: 'Changer les nombres' }).click();
const clean = (text: string | null) => (text ?? '').replace(/^[\n\t ]+|[\n\t ]+$/g, '');

/** Texte lu par les lecteurs d'écran. */
const spoken = (page: Page, id: string) => number(page, id).evaluate((el) => el.shadowRoot!.querySelector('.sr-only')!.textContent);

/** Chiffres visibles : pour roll, celui de la colonne aligné sur la fenêtre ; ailleurs, le texte de chaque case. */
const visible = (page: Page, id: string) =>
  number(page, id).evaluate((el) =>
    [...el.shadowRoot!.querySelector('.digits')!.children]
      .map((child) => {
        const reel = child.querySelector('.reel');
        if (!reel) return child.textContent!.replace(/^[\n\t ]+|[\n\t ]+$/g, '');
        const top = child.getBoundingClientRect().top;
        return [...reel.children].find((digit) => Math.abs(digit.getBoundingClientRect().top - top) < 0.5)?.textContent?.trim() ?? '?';
      })
      .join(''),
  );

test('the server HTML already shows the formatted value, and hydration logs no error', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  const html = await (await page.request.get('/')).text();
  for (const animation of animations) {
    const start = html.indexOf(`data-testid="number-${animation}"`);
    const rendered = html.slice(start, html.indexOf('</cr-number>', start));
    expect(rendered).toContain('<template shadowrootmode="open">');
    expect(rendered).toMatch(new RegExp(`class="[^"]*sr-only[^"]*">(\\s|<!--[^>]*-->)*${fr('6 482')}\\s*<`));
  }
  await page.goto('/');
  await number(page, 'roll').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('screen readers read the final value right away, never the animated digits', async ({ page }) => {
  await page.goto('/');
  await change(page);
  // Deux images après le clic : les animations durent bien plus longtemps.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await visible(page, 'count')).not.toBe(fr('10 315'));
  for (const animation of animations) {
    expect(clean(await spoken(page, animation))).toBe(fr('10 315'));
    await expect(number(page, animation).locator('.digits')).toHaveAttribute('aria-hidden', 'true');
  }
});

test('every animation settles on the right digits', async ({ page }) => {
  await page.goto('/');
  for (const animation of animations) expect(await visible(page, animation)).toBe(fr('6 482'));
  await change(page);
  for (const animation of animations) await expect.poll(() => visible(page, animation)).toBe(fr('10 315'));
  await change(page);
  for (const animation of animations) await expect.poll(() => visible(page, animation)).toBe('999');
});

test('rapid changes end on the last value', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 3; i++) {
    await change(page);
    await page.waitForTimeout(120);
  }
  for (const animation of animations) {
    await expect.poll(() => visible(page, animation)).toBe(fr('7 105'));
    expect(clean(await spoken(page, animation))).toBe(fr('7 105'));
  }
});

test('decimals and grouping follow the language', async ({ page }) => {
  await page.goto('/');
  expect(await visible(page, 'decimals')).toBe(fr('9 723,25'));
  expect(await visible(page, 'english')).toBe('9,723.25');
  await change(page);
  await expect.poll(() => visible(page, 'decimals')).toBe(fr('15 472,75'));
  await expect.poll(() => visible(page, 'english')).toBe('15,472.75');
  expect(clean(await spoken(page, 'english'))).toBe('15,472.75');
});

test('with reduced motion the value changes at once, with no animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await change(page);
  await page.waitForTimeout(50);
  for (const animation of animations) {
    expect(await visible(page, animation)).toBe(fr('10 315'));
    expect(await number(page, animation).evaluate((el) => el.shadowRoot!.getAnimations().length)).toBe(0);
  }
});

test('mid-animation frames have no WCAG 2.1 AA violations detectable by axe', async ({ page }) => {
  await page.goto('/');
  for (const delay of [100, 300]) {
    await change(page);
    await page.waitForTimeout(delay);
    const results = await new AxeBuilder({ page }).include('[data-testid^="number-"]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
    await page.waitForTimeout(1500);
  }
});
