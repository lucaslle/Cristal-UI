import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const copy = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'Copier le lien' });

test('the tooltip text describes its trigger, a cr-button or a native link', async ({ page }) => {
  await expect(copy(page)).toHaveAccessibleDescription("Copie l'adresse de la page");
  await expect(page.getByRole('link', { name: 'Retours sous 30 jours' })).toHaveAccessibleDescription('À compter de la date de livraison');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('keyboard focus shows the tooltip at once and Escape hides it', async ({ page }) => {
  await copy(page).focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(copy(page)).toBeFocused();
  const tip = page.getByRole('tooltip', { name: "Copie l'adresse de la page" });
  await expect(tip).toBeVisible();
  const [tipBox, buttonBox] = [await tip.boundingBox(), await copy(page).boundingBox()];
  expect(tipBox!.y + tipBox!.height).toBeLessThan(buttonBox!.y);
  await page.keyboard.press('Escape');
  await expect(tip).toBeHidden();
  await expect(copy(page)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tooltip', { name: 'À compter de la date de livraison' })).toBeVisible();
});

test('hover shows the tooltip below, it can be hovered, and Escape hides it with focus elsewhere', async ({ page }) => {
  const link = page.getByRole('link', { name: 'Retours sous 30 jours' });
  const tip = page.getByRole('tooltip', { name: 'À compter de la date de livraison' });
  await link.hover();
  await expect(tip).toBeVisible();
  const [tipBox, linkBox] = [await tip.boundingBox(), await link.boundingBox()];
  expect(tipBox!.y).toBeGreaterThan(linkBox!.y + linkBox!.height);
  await page.mouse.move(tipBox!.x + tipBox!.width / 2, tipBox!.y + tipBox!.height / 2, { steps: 5 });
  await page.waitForTimeout(300);
  await expect(tip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tip).toBeHidden();
  await page.mouse.move(0, 0);
  await link.hover();
  await expect(tip).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(tip).toBeHidden();
});

test('a mouse click focuses the trigger without forcing the tooltip open', async ({ page }) => {
  await copy(page).click();
  await page.mouse.move(0, 0);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});
