import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const trigger = (page: Page) => page.getByRole('button', { name: 'Partager' });
const panel = (page: Page) => page.getByRole('dialog', { name: 'Partager' });

test('the button opens a dialog next to it and focus moves into it', async ({ page }) => {
  await expect(trigger(page)).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(panel(page)).toBeHidden();
  await trigger(page).click();
  await expect(panel(page)).toBeVisible();
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('textbox', { name: 'Adresse du destinataire' })).toBeFocused();
  await page.waitForTimeout(500);
  const [panelBox, triggerBox] = [await panel(page).boundingBox(), await trigger(page).boundingBox()];
  const below = panelBox!.y >= triggerBox!.y + triggerBox!.height;
  expect(below || panelBox!.y + panelBox!.height <= triggerBox!.y).toBe(true);
  expect((await new AxeBuilder({ page }).include('cr-popover').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('Escape closes the panel and returns focus to the button', async ({ page }) => {
  await trigger(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('textbox', { name: 'Adresse du destinataire' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('checkbox', { name: 'Autoriser la modification' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
});

test('a click outside or tabbing out closes the panel', async ({ page }) => {
  await trigger(page).click();
  await expect(panel(page)).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(panel(page)).toBeHidden();
  await trigger(page).click();
  await page.getByRole('button', { name: 'Inviter' }).focus();
  await page.keyboard.press('Tab');
  await expect(panel(page)).toBeHidden();
});

test('an action inside closes the panel through the open prop and focus goes back to the button', async ({ page }) => {
  await trigger(page).click();
  await page.getByRole('button', { name: 'Inviter' }).click();
  await expect(panel(page)).toBeHidden();
  await expect(page.getByTestId('popover-state')).toHaveText('Invitation envoyée');
  await expect(trigger(page)).toBeFocused();
});

test('the panel scales in, and simply appears when less motion is requested', async ({ page }) => {
  const animations = () => page.locator('cr-popover').evaluate((el) => el.shadowRoot!.querySelector('.panel')!.getAnimations().length);
  await trigger(page).click();
  expect(await animations()).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await trigger(page).click();
  await expect(panel(page)).toBeVisible();
  expect(await animations()).toBe(0);
});
