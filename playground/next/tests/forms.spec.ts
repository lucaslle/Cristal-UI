import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

const choose = async (page: Page, label: string, option: string) => {
  await page.getByRole('combobox', { name: label }).click();
  await page.getByRole('option', { name: option }).click();
};

const fillValidForm = async (page: Page) => {
  await page.getByLabel('E-mail').fill('autre@example.com');
  await choose(page, 'Pays', 'Belgique');
  await page.getByLabel("J'accepte les conditions").check();
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('blocks submit while required fields are invalid', async ({ page }) => {
  await page.getByRole('button', { name: 'Envoyer' }).click();
  await expect(page.getByTestId('submitted')).toHaveText('Envoyé :');
  expect(await page.locator('cr-select[name="country"]').evaluate((select) => select.matches(':invalid'))).toBe(true);
});

test('submits every field value with the parent form', async ({ page }) => {
  await fillValidForm(page);
  await page.getByRole('button', { name: 'Envoyer' }).click();
  await expect(page.getByTestId('submitted')).toHaveText('Envoyé : {"email":"autre@example.com","country":"be","terms":"on"}');
});

test('submits with Enter from a text field', async ({ page }) => {
  await fillValidForm(page);
  await page.getByLabel('E-mail').press('Enter');
  await expect(page.getByTestId('submitted')).toContainText('"country":"be"');
});

test('resets every field to its initial value', async ({ page }) => {
  await fillValidForm(page);
  await page.locator('form').getByRole('button', { name: 'Réinitialiser' }).click();
  await expect(page.getByLabel('E-mail')).toHaveValue('lucas@example.com');
  await expect(page.getByRole('combobox', { name: 'Pays' })).toHaveText('Choisir un pays');
  await expect(page.getByLabel("J'accepte les conditions")).not.toBeChecked();
});

test('links hint and error messages to their control', async ({ page }) => {
  await expect(page.getByLabel('E-mail')).toHaveAccessibleDescription('Format : nom@domaine.fr');
  const name = page.getByLabel('Nom', { exact: true });
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleDescription('Le nom est obligatoire. Saisissez au moins 2 caractères.');
});

test('picks up options added after load', async ({ page }) => {
  await page.locator('cr-select[name="country"]').evaluate((select) => {
    const option = document.createElement('option');
    option.value = 'lu';
    option.textContent = 'Luxembourg';
    select.append(option);
  });
  await choose(page, 'Pays', 'Luxembourg');
  await expect(page.getByRole('combobox', { name: 'Pays' })).toHaveText('Luxembourg');
});

test('shows French errors on submit and focuses the first invalid field', async ({ page }) => {
  await page.getByLabel('E-mail').fill('');
  await page.getByRole('button', { name: 'Envoyer' }).click();
  const email = page.getByLabel('E-mail');
  await expect(email).toBeFocused();
  await expect(email).toHaveAccessibleDescription(/Ce champ est obligatoire/);
  await expect(page.getByRole('combobox', { name: 'Pays' })).toHaveAccessibleDescription('Choisissez une option dans la liste.');
  await expect(page.getByLabel("J'accepte les conditions")).toHaveAccessibleDescription('Cochez cette case pour continuer.');
});

test('flags a malformed e-mail when leaving the field, and clears it once fixed', async ({ page }) => {
  const email = page.getByLabel('E-mail');
  await email.fill('lucas@');
  await email.blur();
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(email).toHaveAccessibleDescription(/Saisissez une adresse e-mail valide/);
  await email.fill('lucas@example.com');
  await expect(email).not.toHaveAttribute('aria-invalid', 'true');
});
