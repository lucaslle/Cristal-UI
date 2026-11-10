import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const audit = (page: import('@playwright/test').Page) =>
  new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

test('page has no WCAG 2.1 AA violations detectable by axe', async ({ page }) => {
  await page.goto('/');
  expect((await audit(page)).violations).toEqual([]);
});

for (const [trigger, name] of [['Supprimer le produit', 'Supprimer le produit ?'], ['Filtres', 'Filtres']]) {
  test(`open overlay "${name}" has no WCAG 2.1 AA violations detectable by axe`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: trigger }).click();
    await expect(page.getByRole('dialog', { name })).toBeVisible();
    expect((await audit(page)).violations).toEqual([]);
  });
}

test('open menu has no WCAG 2.1 AA violations detectable by axe', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'outline-trace', exact: true }).click();
  await expect(page.getByRole('menu', { name: 'outline-trace' })).toBeVisible();
  await page.waitForTimeout(700);
  expect((await audit(page)).violations).toEqual([]);
});

test('open accordions have no WCAG 2.1 AA violations detectable by axe', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tout ouvrir' }).click();
  await page.getByRole('button', { name: 'Continuer' }).first().click();
  await page.getByRole('button', { name: /Développement/ }).click();
  await page.getByRole('button', { name: /Total/ }).click();
  await page.waitForTimeout(1200);
  expect((await audit(page)).violations).toEqual([]);
});

test('table with its columns menu open has no WCAG 2.1 AA violations detectable by axe', async ({ page }) => {
  await page.goto('/');
  await page.locator('cr-table[label="Commandes de la semaine"]').getByRole('button', { name: /Colonnes/ }).click();
  await page.waitForTimeout(400);
  expect((await audit(page)).violations).toEqual([]);
});

test('animated fields have no WCAG 2.1 AA violations detectable by axe', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('form', { has: page.getByLabel('Code reçu par SMS') });
  await form.getByRole('textbox', { name: 'Code reçu par SMS' }).fill('482913');
  await form.getByRole('textbox', { name: 'Carte bancaire' }).fill('4242424242424242');
  await form.getByLabel('Nouveau mot de passe').fill('Sunset42');
  await form.getByLabel('Adresse de contact').pressSequentially('mia@mail.co');
  await page.waitForTimeout(800);
  expect((await audit(page)).violations).toEqual([]);
});

test('dashboard has no WCAG 2.1 AA violations detectable by axe', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ajouter « Alertes »' }).click();
  await page.waitForTimeout(500);
  expect((await new AxeBuilder({ page }).include('cr-dashboard').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
});
