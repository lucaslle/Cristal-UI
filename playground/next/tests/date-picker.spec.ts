import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

// Le jour courant est fixé (10 mars 2025 à Paris) : les tests ne dépendent ni de la date ni du fuseau de la machine.
test.use({ timezoneId: 'Europe/Paris' });

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2025-03-10T12:00:00Z'));
  await page.goto('/');
});

const field = (page: Page) => page.getByRole('textbox', { name: 'Date de livraison' });
const toggle = (page: Page) => page.locator('cr-date-picker[name="delivery"]').getByRole('button', { name: /date/ });
const dialog = (page: Page) => page.getByRole('dialog', { name: 'Choisir une date' });
const day = (page: Page, name: string) => dialog(page).getByRole('button', { name, exact: true });

test('typing in the French format updates the value, React and the form', async ({ page }) => {
  await expect(field(page)).toHaveValue('14/03/2025');
  await expect(field(page)).toHaveAccessibleDescription('Format : JJ/MM/AAAA');
  await expect(toggle(page)).toHaveAccessibleName('Changer la date, vendredi 14 mars 2025');
  await field(page).fill('1/4/2025');
  await field(page).press('Tab');
  await expect(field(page)).toHaveValue('01/04/2025');
  await expect(page.getByTestId('date-value')).toHaveText('2025-04-01');
  await page.getByRole('button', { name: 'Planifier la livraison' }).click();
  await expect(page.getByTestId('date-sent')).toHaveText('2025-04-01');
});

test('an impossible, out of range or missing date shows an error and blocks the form', async ({ page }) => {
  await field(page).fill('31/02/2025');
  await field(page).blur();
  await expect(field(page)).toHaveAttribute('aria-invalid', 'true');
  await expect(field(page)).toHaveAccessibleDescription(/Saisissez une date valide au format JJ\/MM\/AAAA\./);
  await field(page).fill('01/05/2025');
  await expect(field(page)).toHaveAccessibleDescription(/Choisissez une date entre le 03\/03\/2025 et le 30\/04\/2025\./);
  await field(page).fill('');
  await page.getByRole('button', { name: 'Planifier la livraison' }).click();
  await expect(field(page)).toBeFocused();
  await expect(field(page)).toHaveAccessibleDescription(/Ce champ est obligatoire\./);
  await expect(page.getByTestId('date-sent')).toHaveText('');
});

test('the calendar opens on the selected day and the keyboard follows the APG date picker', async ({ page }) => {
  await toggle(page).click();
  await expect(dialog(page)).toBeVisible();
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog(page).getByRole('grid', { name: 'mars 2025' })).toBeVisible();
  await expect(dialog(page).getByRole('columnheader').first()).toHaveText('lun.');
  await expect(day(page, 'vendredi 14 mars 2025')).toBeFocused();
  await expect(dialog(page).getByRole('gridcell', { selected: true })).toHaveText('14');
  await page.keyboard.press('ArrowRight');
  await expect(day(page, 'samedi 15 mars 2025')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(day(page, 'samedi 22 mars 2025')).toBeFocused();
  await page.keyboard.press('PageDown');
  await expect(dialog(page).getByRole('grid', { name: 'avril 2025' })).toBeVisible();
  await expect(day(page, 'mardi 22 avril 2025')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(day(page, 'lundi 21 avril 2025')).toBeFocused();
  await page.keyboard.press('End');
  await expect(day(page, 'dimanche 27 avril 2025')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog(page)).toBeHidden();
  await expect(toggle(page)).toBeFocused();
  await expect(toggle(page)).toHaveAccessibleName('Changer la date, dimanche 27 avril 2025');
  await expect(field(page)).toHaveValue('27/04/2025');
  await expect(page.getByTestId('date-value')).toHaveText('2025-04-27');
});

test('min and max bound the calendar, Tab stays inside, Escape closes and gives focus back', async ({ page }) => {
  await toggle(page).click();
  await expect(day(page, 'dimanche 2 mars 2025')).toBeDisabled();
  await page.keyboard.press('PageUp');
  await expect(day(page, 'lundi 3 mars 2025')).toBeFocused();
  await expect(dialog(page).getByRole('button', { name: 'Mois précédent' })).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Tab');
  await expect(dialog(page).getByRole('button', { name: 'Mois précédent' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog(page).getByRole('button', { name: 'Mois suivant' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog(page).getByRole('grid', { name: 'avril 2025' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(day(page, 'jeudi 3 avril 2025')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  await expect(toggle(page)).toBeFocused();
  await expect(field(page)).toHaveValue('14/03/2025');
});

test('an empty picker opens on today, marked as the current date, and a click picks a day', async ({ page }) => {
  const birth = page.locator('cr-date-picker[name="birth"]');
  await birth.getByRole('button', { name: 'Choisir une date' }).click();
  const today = day(page, 'lundi 10 mars 2025');
  await expect(today).toBeFocused();
  await expect(today).toHaveAttribute('aria-current', 'date');
  await day(page, 'mercredi 5 mars 2025').click();
  await expect(birth.getByRole('textbox')).toHaveValue('05/03/2025');
});

test('the open calendar has no WCAG 2.1 AA violations detectable by axe', async ({ page }) => {
  await toggle(page).click();
  await expect(day(page, 'vendredi 14 mars 2025')).toBeFocused();
  await page.waitForTimeout(500);
  const results = await new AxeBuilder({ page }).include('cr-date-picker').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
