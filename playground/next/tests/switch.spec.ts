import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('click, label and Space toggle the switch, emit crChange and fill the form', async ({ page }) => {
  const wifi = page.getByRole('switch', { name: 'Wi-Fi' });
  const sent = () => page.getByTestId('switch-form').evaluate((form) => new FormData(form as HTMLFormElement).get('wifi'));
  await expect(wifi).not.toBeChecked();
  expect(await sent()).toBeNull();
  await wifi.click();
  await expect(wifi).toBeChecked();
  await expect(page.getByTestId('switch-value')).toHaveText('activé');
  expect(await sent()).toBe('on');
  await page.keyboard.press('Space');
  await expect(wifi).not.toBeChecked();
  await page.getByText('Wi-Fi', { exact: true }).click();
  await expect(wifi).toBeChecked();
});

test('focus is visible and a disabled switch cannot be toggled', async ({ page }) => {
  const wifi = page.getByRole('switch', { name: 'Wi-Fi' });
  await wifi.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(wifi).toBeFocused();
  const outline = await page.locator('cr-switch[name="wifi"]').evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.track')!).outlineStyle);
  expect(outline).toBe('solid');
  const plane = page.getByRole('switch', { name: 'Mode avion' });
  await expect(plane).toBeChecked();
  await expect(plane).toBeDisabled();
});

test('the knob slides to the end of the track', async ({ page }) => {
  await page.getByRole('switch', { name: 'Wi-Fi' }).click();
  await page.waitForTimeout(500);
  const [knob, track] = await page.locator('cr-switch[name="wifi"]').evaluate((el) =>
    ['.knob', '.track'].map((selector) => Math.round(el.shadowRoot!.querySelector(selector)!.getBoundingClientRect().right)),
  );
  expect(track - knob).toBe(3);
});
