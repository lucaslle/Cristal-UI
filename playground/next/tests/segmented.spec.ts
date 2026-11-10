import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('click and arrow keys pick an option, emit crChange and fill the form', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Période', exact: true });
  await expect(group.getByRole('radio', { name: 'Mois' })).toBeChecked();
  await group.getByRole('radio', { name: 'Semaine' }).click();
  await expect(page.getByTestId('segmented-value')).toHaveText('week');
  await page.keyboard.press('ArrowRight');
  await expect(group.getByRole('radio', { name: 'Mois' })).toBeChecked();
  await expect(group.getByRole('radio', { name: 'Mois' })).toBeFocused();
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowRight');
  await expect(group.getByRole('radio', { name: 'Jour' })).toBeChecked();
  const sent = await page.getByTestId('segmented-form').evaluate((form) => new FormData(form as HTMLFormElement).get('period'));
  expect(sent).toBe('day');
});

test('the thumb slides under the chosen segment', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Période', exact: true });
  await group.getByRole('radio', { name: 'Année' }).click();
  await page.waitForTimeout(600);
  const [thumb, segment] = await page.locator('cr-segmented[name="period"]').evaluate((el) =>
    ['.thumb', '[aria-checked="true"]'].map((selector) => Math.round(el.shadowRoot!.querySelector(selector)!.getBoundingClientRect().left)),
  );
  expect(thumb).toBe(segment);
});

test('counts are read with the label, disabled options are skipped', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Tâches' });
  await expect(group.getByRole('radio', { name: 'Jour (4)' })).toBeChecked();
  await expect(group.getByRole('radio', { name: 'Archivées' })).toBeDisabled();
  await group.getByRole('radio', { name: 'Jour (4)' }).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(group.getByRole('radio', { name: 'Jour (4)' })).toBeChecked();
});
