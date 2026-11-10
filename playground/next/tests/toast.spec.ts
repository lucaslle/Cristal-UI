import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const saved = 'Modifications enregistrées.';
const failed = 'Synchronisation impossible : vérifiez votre connexion.';

test('a success toast is announced as a status, then closes by itself', async ({ page }) => {
  await page.getByRole('button', { name: 'Enregistrer la fiche' }).click();
  const toast = page.locator('cr-toast', { hasText: saved });
  await expect(page.getByText(saved)).toBeVisible();
  await expect(toast.getByRole('status')).toBeAttached();
  await expect(page.getByText(saved)).toBeHidden({ timeout: 4000 });
  await expect(page.getByTestId('toast-closed')).toHaveText('1');
});

test('the timer pauses while the pointer is on the toast', async ({ page }) => {
  await page.getByRole('button', { name: 'Enregistrer la fiche' }).click();
  await page.getByText(saved).hover();
  await page.waitForTimeout(2600);
  await expect(page.getByText(saved)).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(page.getByText(saved)).toBeHidden({ timeout: 4000 });
});

test('a danger toast is an alert that stays until closed with the button or Escape', async ({ page }) => {
  const send = page.getByRole('button', { name: 'Synchroniser' });
  await send.click();
  await send.click();
  const toasts = page.locator('cr-toast', { hasText: failed });
  await expect(page.getByText(failed)).toHaveCount(2);
  await expect(toasts.first().getByRole('alert')).toBeAttached();
  await page.waitForTimeout(2500);
  await expect(page.getByText(failed)).toHaveCount(2);
  await toasts.first().getByRole('button', { name: 'Fermer' }).click();
  await expect(page.getByText(failed)).toHaveCount(1);
  await toasts.getByRole('button', { name: 'Fermer' }).focus();
  await page.keyboard.press('Escape');
  await expect(page.getByText(failed)).toHaveCount(0);
  await expect(page.getByTestId('toast-closed')).toHaveText('2');
});

test('dragging a toast sideways dismisses it', async ({ page }) => {
  await page.getByRole('button', { name: 'Synchroniser' }).click();
  await expect(page.getByText(failed)).toBeVisible();
  const rect = (await page.locator('cr-toast .toast').boundingBox())!;
  await page.mouse.move(rect.x + 40, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect.x + 40 + rect.width / 2, rect.y + rect.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect(page.getByTestId('toast-closed')).toHaveText('1');
});

test('open toasts have no WCAG 2.1 AA violations detectable by axe', async ({ page }) => {
  await page.getByRole('button', { name: 'Synchroniser' }).click();
  await page.getByRole('button', { name: 'Enregistrer la fiche' }).click();
  await page.getByRole('button', { name: 'Enregistrer la fiche' }).hover();
  await page.waitForTimeout(500);
  const results = await new AxeBuilder({ page }).include('cr-toaster').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
