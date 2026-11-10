import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('a required group blocks submit, shows an error and takes focus', async ({ page }) => {
  await page.getByRole('button', { name: 'Commander' }).click();
  const group = page.getByRole('radiogroup', { name: 'Mode de livraison' });
  await expect(group).toHaveAttribute('aria-invalid', 'true');
  await expect(group).toHaveAccessibleDescription('Choisissez une des options.');
  await expect(group.getByRole('radio', { name: 'Standard, 3 à 5 jours' })).toBeFocused();
  await expect(page.getByTestId('radio-sent')).toHaveText('');
});

test('arrow keys move and select, wrap and skip disabled options, Tab is a single stop', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Mode de livraison' });
  const radio = (name: string) => group.getByRole('radio', { name });
  await expect(radio('Standard, 3 à 5 jours')).toHaveAttribute('tabindex', '0');
  await expect(radio('Express, 24 h')).toHaveAttribute('tabindex', '-1');
  await radio('Standard, 3 à 5 jours').focus();
  await page.keyboard.press('ArrowDown');
  await expect(radio('Express, 24 h')).toBeChecked();
  await expect(radio('Express, 24 h')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(radio('Retrait en magasin')).toBeChecked();
  await expect(radio('Drone, indisponible')).toBeDisabled();
  await page.keyboard.press('ArrowRight');
  await expect(radio('Standard, 3 à 5 jours')).toBeChecked();
  await page.keyboard.press('ArrowUp');
  await expect(radio('Retrait en magasin')).toBeChecked();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Commander' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(radio('Retrait en magasin')).toBeFocused();
});

test('a click selects, the dot lands in the chosen circle and the form is sent', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Mode de livraison' });
  await group.getByRole('radio', { name: 'Retrait en magasin' }).click();
  await expect(group.getByRole('radio', { name: 'Retrait en magasin' })).toBeChecked();
  await expect(group).not.toHaveAttribute('aria-invalid');
  await page.waitForTimeout(600);
  const [dot, circle] = await page.locator('cr-radio-group').evaluate((el) =>
    ['.dot', '[aria-checked="true"] .circle'].map((selector) => {
      const rect = el.shadowRoot!.querySelector(selector)!.getBoundingClientRect();
      return Math.round(rect.top + rect.height / 2);
    }),
  );
  expect(dot).toBe(circle);
  await page.getByRole('button', { name: 'Commander' }).click();
  await expect(page.getByTestId('radio-sent')).toHaveText('store');
});
