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

test('with cr-tab-panel children, tabs control their panel, only the chosen panel is shown', async ({ page }) => {
  const tabs = page.getByTestId('tabs');
  const description = tabs.getByRole('tab', { name: 'Description' });
  await expect(tabs.getByRole('tablist', { name: 'Fiche produit' })).toBeVisible();
  await expect(description).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.getByRole('tabpanel', { name: 'Description' })).toBeVisible();
  await expect(page.getByText('Lampe de bureau en chêne')).toBeVisible();
  await expect(page.getByText('Hauteur 45 cm')).toBeHidden();
  await tabs.getByRole('tab', { name: 'Avis' }).click();
  await expect(tabs.getByRole('tabpanel', { name: 'Avis' })).toBeVisible();
  await expect(page.getByText('4,6 sur 5')).toBeVisible();
  await expect(page.getByText('Lampe de bureau en chêne')).toBeHidden();
  await expect(page.getByTestId('tabs-value')).toHaveText('2');
  const sent = await page.getByTestId('segmented-form').evaluate((form) => new FormData(form as HTMLFormElement).has('tab'));
  expect(sent).toBe(false);
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

test('the underline slides under the chosen tab', async ({ page }) => {
  await page.getByTestId('tabs').getByRole('tab', { name: 'Avis' }).click();
  await page.waitForTimeout(600);
  const [indicator, tab] = await page.getByTestId('tabs').evaluate((el) =>
    ['.thumb', '[aria-selected="true"]'].map((selector) => {
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
