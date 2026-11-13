import { expect, test, type Page } from '@playwright/test';

const chart = (page: Page, label: string) => page.locator(`cr-chart[label="${label}"]`);
const plot = (page: Page, label: string) => chart(page, label).getByRole('group', { name: label });
const status = (page: Page, label: string) => chart(page, label).locator('[role="status"]');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await chart(page, 'Ventes et retours').scrollIntoViewIfNeeded();
});

test('columns: one group per category, a legend for two series, tooltip on hover', async ({ page }) => {
  const sales = chart(page, 'Ventes et retours');
  await expect(sales.locator('.column')).toHaveCount(24);
  await expect(sales.locator('.legend li')).toHaveText(['Ventes', 'Retours']);
  await sales.locator('.hit').nth(8).hover();
  await expect(sales.locator('.tooltip')).toContainText('Sept.');
  await expect(sales.locator('.tooltip')).toContainText(/26\s500\s€/);
  await expect(sales.locator('.column.dim')).toHaveCount(22);
  await page.mouse.move(0, 0);
  await expect(sales.locator('.tooltip')).toHaveCount(0);
});

test('keyboard: arrows, Home and End go through the categories and announce the values', async ({ page }) => {
  await plot(page, 'Ventes et retours').focus();
  await page.keyboard.press('ArrowRight');
  await expect(status(page, 'Ventes et retours')).toHaveText(/^Janv\. : Ventes 12\s400\s€, Retours 900\s€$/);
  await page.keyboard.press('End');
  await expect(status(page, 'Ventes et retours')).toHaveText(/^Déc\. :/);
  await expect(chart(page, 'Ventes et retours').locator('.tooltip')).toContainText('Déc.');
  await page.keyboard.press('Escape');
  await expect(chart(page, 'Ventes et retours').locator('.tooltip')).toHaveCount(0);
});

test('the data table is the accessible twin of the drawing', async ({ page }) => {
  const sales = chart(page, 'Ventes et retours');
  const toggle = sales.getByRole('button', { name: 'Afficher les données' });
  await expect(sales.getByRole('table')).toBeHidden();
  await toggle.click();
  await expect(sales.getByRole('button', { name: 'Masquer les données' })).toHaveAttribute('aria-expanded', 'true');
  const table = sales.getByRole('table', { name: 'Ventes et retours' });
  await expect(table.getByRole('columnheader')).toHaveText(['Catégorie', 'Ventes', 'Retours']);
  await expect(table.getByRole('row')).toHaveCount(13);
  await expect(table.getByRole('row', { name: /Mars/ })).toContainText(/14\s100\s€/);
});

test('new data redraws the chart', async ({ page }) => {
  await page.getByRole('button', { name: 'Second semestre' }).click();
  await expect(chart(page, 'Ventes et retours').locator('.column')).toHaveCount(12);
});

test('line and area: crosshair and one dot per series, end value on a single series', async ({ page }) => {
  const lines = chart(page, 'Ventes par canal');
  await lines.scrollIntoViewIfNeeded();
  await lines.locator('.hit').nth(3).hover();
  await expect(lines.locator('.crosshair')).toHaveCount(1);
  await expect(lines.locator('.dot')).toHaveCount(3);
  await expect(lines.locator('.tooltip .tooltip-row')).toHaveCount(3);
  await expect(chart(page, 'Visites des 30 derniers jours').locator('.end-label')).toHaveText(/1\s569/);
});

test('bars: value at the tip of each bar', async ({ page }) => {
  const bars = chart(page, 'Top produits');
  await expect(bars.locator('.row')).toHaveCount(5);
  await expect(bars.locator('.bar-value').first()).toHaveText(/48\s200\s€/);
});

test('donut: small parts fold into "Autres", the centre shows the total or the hovered part', async ({ page }) => {
  const donut = chart(page, 'Répartition par région');
  await donut.scrollIntoViewIfNeeded();
  await expect(donut.locator('.legend-name')).toHaveText(['Nord', 'Sud', 'Est', 'Ouest', 'Centre', 'Autres']);
  await expect(donut.locator('.center')).toContainText(/1\s570/);
  await expect(donut.locator('.center')).toContainText('Total');
  await plot(page, 'Répartition par région').focus();
  await page.keyboard.press('ArrowRight');
  await expect(status(page, 'Répartition par région')).toHaveText(/^Nord : 420, 27\s%$/);
  await expect(donut.locator('.center')).toContainText('Nord');
});

test('no data: a message, and nothing to tab into', async ({ page }) => {
  const empty = chart(page, 'Sans données');
  await expect(empty.getByText('Aucune donnée')).toBeVisible();
  await expect(plot(page, 'Sans données')).not.toHaveAttribute('tabindex');
});

test('charts are accessible, with the data tables open', async ({ page }) => {
  const AxeBuilder = (await import('@axe-core/playwright')).default;
  const toggles = page.locator('cr-chart .toggle');
  for (let i = 0; i < (await toggles.count()); i++) await toggles.nth(i).click();
  await expect(page.locator('cr-chart .toggle[aria-expanded="false"]')).toHaveCount(0);
  const result = await new AxeBuilder({ page }).include('cr-chart').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(result.violations).toEqual([]);
});
