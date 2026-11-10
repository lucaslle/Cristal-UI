import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const avatars = (page: Page) => page.getByTestId('avatars');
const group = (page: Page) => page.getByTestId('avatar-group');
const background = (page: Page, selector: string) => page.locator(selector).first().evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.avatar')!).backgroundColor);

test('each avatar is an image named by the person and the status', async ({ page }) => {
  for (const name of ['Marie Dupont, en ligne', 'Karim Benali, absent', 'Léa Martin, occupé', 'Tom Petit, hors ligne']) {
    await expect(avatars(page).getByRole('img', { name, exact: true })).toBeVisible();
  }
  await expect(avatars(page).getByRole('img', { name: 'Marie Dupont, en ligne' })).toHaveText('MD');
});

test('statuses differ by shape, and the online halo pulses three times then stops', async ({ page }) => {
  const marks = await avatars(page)
    .locator('cr-avatar')
    .evaluateAll((els) => els.map((el) => el.shadowRoot!.querySelector('.status path')?.getAttribute('d') ?? 'ring'));
  expect(new Set(marks).size).toBe(4);
  const pulse = await page.locator('cr-avatar[status="online"]').first().evaluate((el) => {
    const style = getComputedStyle(el.shadowRoot!.querySelector('.avatar')!, '::after');
    return [style.animationIterationCount, style.animationDuration];
  });
  expect(pulse).toEqual(['3', '1.5s']);
});

test('a photo replaces the initials, and the initials come back when it fails to load', async ({ page }) => {
  await expect(page.locator('cr-avatar[name="Karim Benali"]').locator('img')).toBeVisible();
  const broken = avatars(page).getByRole('img', { name: 'Tom Petit, hors ligne' });
  await expect(broken).toHaveText('TP');
  await Promise.all([
    page.waitForResponse('**/photo-introuvable.png'),
    avatars(page).locator('cr-avatar[name="Tom Petit"]').evaluate((el: HTMLElement & { src?: string }) => (el.src = '/photo-introuvable.png')),
  ]);
  await expect(avatars(page).locator('cr-avatar[name="Tom Petit"]').locator('img')).toHaveCount(0);
  await expect(broken).toHaveText('TP');
});

test('the initials colour comes from the name: same name, same colour', async ({ page }) => {
  const single = await background(page, '[data-testid="avatars"] cr-avatar[name="Marie Dupont"]');
  expect(single).toMatch(/^(oklch|rgb)\(/);
  expect(await background(page, '[data-testid="avatar-group"] cr-avatar[name="Marie Dupont"]')).toBe(single);
  expect(await background(page, '[data-testid="avatar-group"] cr-avatar[name="Léa Martin"]')).not.toBe(single);
});

test('a group shows max avatars and "+N" for the rest, and fans out on hover', async ({ page }) => {
  await expect(group(page).getByRole('img')).toHaveCount(4);
  await expect(group(page).getByRole('img', { name: '2 autres personnes' })).toHaveText('+2');
  await expect(group(page).locator('cr-avatar[name="Tom Petit"]')).toBeHidden();
  const second = group(page).locator('cr-avatar').nth(1);
  const margin = () => second.evaluate((el) => getComputedStyle(el).marginLeft);
  expect(await margin()).toBe('-8px');
  await group(page).hover();
  await expect.poll(margin).toBe('4px');
});
