import { expect, test, type Locator, type Page } from '@playwright/test';

const animations = ['pop', 'bounce', 'stretch', 'spin', 'merge', 'zoom', 'tint'];
const demo = (page: Page, animation: string) => page.getByTestId(`otp-${animation}`);

// Styles calculés du groupe et des cases : ce qui doit revenir à l'identique après Retour arrière.
const looks = (host: Locator) =>
  host.evaluate((el) => {
    const otp = el.shadowRoot!.querySelector('.otp')!;
    const boxes = Array.from(el.shadowRoot!.querySelectorAll('.box'));
    const pick = (node: Element, keys: string[]) => keys.map((key) => getComputedStyle(node).getPropertyValue(key)).join('|');
    return [pick(otp, ['gap', 'width']), ...boxes.slice(0, 5).map((box) => pick(box, ['border-radius', 'border-width', 'box-shadow', 'background-color', 'color']))];
  });

const errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await demo(page, 'pop').scrollIntoViewIfNeeded();
});

test.afterEach(() => expect(errors).toEqual([]));

for (const animation of animations) {
  test(`otp ${animation}: the attribute reflects and typing a full code completes`, async ({ page }) => {
    const host = demo(page, animation).locator('cr-otp');
    await expect(host).toHaveAttribute('animation', animation);
    const otp = demo(page, animation).getByRole('textbox', { name: `Code, animation ${animation}` });
    await otp.pressSequentially('482913', { delay: 60 });
    await expect(otp).toHaveValue('482913');
    await expect(demo(page, animation).getByText('Complet : 482913')).toBeVisible();
    await expect(host.locator('.otp.complete')).toBeVisible();
    await expect(host.locator('.box.filled')).toHaveCount(6);
  });
}

for (const animation of ['merge', 'tint']) {
  test(`otp ${animation}: Backspace after the full code goes back to the plain boxes`, async ({ page }) => {
    const host = demo(page, animation).locator('cr-otp');
    const otp = demo(page, animation).getByRole('textbox');
    await otp.pressSequentially('48291', { delay: 60 });
    await page.waitForTimeout(800);
    const before = await looks(host);
    await otp.press('3');
    await expect(host.locator('.otp.complete')).toBeVisible();
    await page.waitForTimeout(1200);
    expect(await looks(host)).not.toEqual(before);
    await otp.press('Backspace');
    await expect(otp).toHaveValue('48291');
    await expect(host.locator('.otp.complete')).toHaveCount(0);
    await expect.poll(() => looks(host)).toEqual(before);
  });
}

test('otp: with reduced motion, no variant animates', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const animation of animations) {
    const host = demo(page, animation).locator('cr-otp');
    const running = () => host.evaluate((el) => el.shadowRoot!.getAnimations().filter((a) => a.playState !== 'finished').length);
    const otp = demo(page, animation).getByRole('textbox');
    await otp.pressSequentially('482', { delay: 30 });
    expect(await running()).toBe(0);
    await otp.pressSequentially('913', { delay: 30 });
    await expect(host.locator('.otp.complete')).toBeVisible();
    expect(await running()).toBe(0);
    await otp.press('Backspace');
    expect(await running()).toBe(0);
  }
});
