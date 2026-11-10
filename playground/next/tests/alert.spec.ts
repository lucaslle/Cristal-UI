import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('an alert is a status region (alert for danger) that names its type before the message', async ({ page }) => {
  await expect(page.getByTestId('alert-info')).toMatchAriaSnapshot(`
    - status:
      - text: "Information :"
      - strong: Nouvelle version
      - text: La version 2.4 ajoute l'export en PDF.
  `);
  await expect(page.getByTestId('alert-success')).toMatchAriaSnapshot('- status: "Succès : Paiement reçu, merci."');
  await expect(page.getByTestId('alert-warning').getByRole('status')).toContainText('Attention : Stock bas');
  await expect(page.getByTestId('alert-danger').getByRole('alert')).toContainText('Synchronisation impossible');
  await expect(page.getByTestId('alert-info').getByRole('button')).toHaveCount(0);
});

test('inserted after load it unfolds, present at load it does not; its icon draws itself, without fading text', async ({ page }) => {
  expect(await page.getByTestId('alert-warning').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await page.getByRole('button', { name: "Lancer l'export" }).click();
  const alert = page.getByTestId('alert-late');
  await expect(alert).toMatchAriaSnapshot('- status: "Succès : Export terminé."');
  expect(await alert.evaluate((el) => getComputedStyle(el).animationName)).toBe('cr-alert-unfold');
  expect(await page.getByTestId('alert-warning').evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.icon path')!).animationName)).toBe('cr-alert-draw');
  const icon = await alert.evaluate((el) => Array.from(el.shadowRoot!.querySelectorAll('.icon *'), (shape) => [shape.tagName, getComputedStyle(shape).animationName]));
  expect(icon).toEqual([
    ['circle', 'cr-alert-draw'],
    ['path', 'cr-alert-draw'],
  ]);
  expect(await alert.evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.content')!).opacity)).toBe('1');
});

test('the Fermer button folds the alert away, from the keyboard too, and emits crClose', async ({ page }) => {
  const alert = page.getByTestId('alert-danger');
  const close = alert.getByRole('button', { name: 'Fermer' });
  await close.focus();
  await page.keyboard.press('Enter');
  await expect(alert).toBeHidden();
  await expect(page.getByTestId('alert-closed')).toHaveText('1');
});

const saved = 'Modifications enregistrées.';
const failed = 'Synchronisation impossible : vérifiez votre connexion.';

test('a success toast is announced as a status, then closes by itself', async ({ page }) => {
  await page.getByRole('button', { name: 'Enregistrer la fiche' }).click();
  const toast = page.locator('cr-toaster cr-alert', { hasText: saved });
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

test('the timer pauses while focus is in the toast, and its bar shows the time left', async ({ page }) => {
  await page.getByRole('button', { name: 'Enregistrer la fiche' }).click();
  const toast = page.locator('cr-toaster cr-alert', { hasText: saved });
  await expect(toast.locator('.bar')).toBeVisible();
  await toast.getByRole('button', { name: 'Fermer' }).focus();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(2600);
  await expect(page.getByText(saved)).toBeVisible();
  await page.getByRole('button', { name: 'Synchroniser' }).focus();
  await expect(page.getByText(saved)).toBeHidden({ timeout: 4000 });
});

test('a danger toast is an alert that stays until closed with the button or Escape', async ({ page }) => {
  const send = page.getByRole('button', { name: 'Synchroniser' });
  await send.click();
  await send.click();
  const toasts = page.locator('cr-toaster cr-alert', { hasText: failed });
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
  const rect = (await page.locator('cr-toaster cr-alert .alert').boundingBox())!;
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
