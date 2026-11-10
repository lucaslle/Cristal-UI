import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('tabs control their panel, only the chosen panel is shown', async ({ page }) => {
  const tabs = page.getByTestId('tabs');
  const description = tabs.getByRole('tab', { name: 'Description' });
  await expect(tabs.getByRole('tablist')).toBeVisible();
  await expect(description).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.getByRole('tabpanel', { name: 'Description' })).toBeVisible();
  await expect(page.getByText('Lampe de bureau en chêne')).toBeVisible();
  await expect(page.getByText('Hauteur 45 cm')).toBeHidden();
  await tabs.getByRole('tab', { name: 'Avis' }).click();
  await expect(tabs.getByRole('tabpanel', { name: 'Avis' })).toBeVisible();
  await expect(page.getByText("4,6 sur 5")).toBeVisible();
  await expect(page.getByText('Lampe de bureau en chêne')).toBeHidden();
  await expect(page.getByTestId('tabs-value')).toHaveText('2');
});

test('arrow keys, Home and End move and activate tabs, Tab goes to the panel', async ({ page }) => {
  const tabs = page.getByTestId('tabs');
  const tab = (name: string) => tabs.getByRole('tab', { name });
  await expect(tab('Caractéristiques')).toHaveAttribute('tabindex', '-1');
  await tab('Description').focus();
  await page.keyboard.press('ArrowRight');
  await expect(tab('Caractéristiques')).toBeFocused();
  await expect(tab('Caractéristiques')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('Hauteur 45 cm')).toBeVisible();
  await page.keyboard.press('End');
  await expect(tab('Avis')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(tab('Description')).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(tab('Avis')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(tab('Description')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Tab');
  await expect(tabs.getByRole('tabpanel', { name: 'Description' })).toBeFocused();
});

test('the indicator slides under the chosen tab', async ({ page }) => {
  await page.getByTestId('tabs').getByRole('tab', { name: 'Avis' }).click();
  await page.waitForTimeout(600);
  const [indicator, tab] = await page.getByTestId('tabs').evaluate((el) =>
    ['.indicator', '[aria-selected="true"]'].map((selector) => {
      const rect = el.shadowRoot!.querySelector(selector)!.getBoundingClientRect();
      return [Math.round(rect.left), Math.round(rect.width)];
    }),
  );
  expect(indicator).toEqual(tab);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('server-rendered tabs already show only the chosen panel', async ({ page }) => {
    const tabs = page.getByTestId('ssr-tabs');
    await expect(tabs.getByRole('tab', { name: 'Retours' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Retour gratuit sous 30 jours.')).toBeVisible();
    await expect(page.getByText('Livraison offerte dès 50 €.')).toBeHidden();
  });
});
