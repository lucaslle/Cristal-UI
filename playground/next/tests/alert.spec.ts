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
