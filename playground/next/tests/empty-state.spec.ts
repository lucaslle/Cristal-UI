import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('an empty state reads as its heading, its description and its actions; the illustration is hidden', async ({ page }) => {
  await expect(page.getByTestId('empty-search')).toMatchAriaSnapshot(`
    - paragraph: Aucun produit trouvé
    - text: Essayez un autre mot ou retirez des filtres.
    - link "Voir tout le catalogue"
  `);
  await expect(page.getByTestId('empty-search').getByRole('img')).toHaveCount(0);
  await expect(page.getByTestId('empty-inbox')).toMatchAriaSnapshot(`
    - paragraph: Aucune facture
    - text: Vos factures apparaîtront ici après votre première commande.
  `);
});

test('the illustration matches the prop, floats three times then stops, and is absent with none', async ({ page }) => {
  const shapes = (id: string) => page.getByTestId(id).evaluate((el) => Array.from(el.shadowRoot!.querySelectorAll('.illustration svg > *'), (node) => node.tagName));
  expect(await shapes('empty-search')).toEqual(['g']);
  expect(await shapes('empty-inbox')).toEqual(['path', 'path']);
  expect(await shapes('empty-plain')).toEqual([]);
  const animation = await page.getByTestId('empty-inbox').evaluate((el) => {
    const style = getComputedStyle(el.shadowRoot!.querySelector('.illustration svg')!);
    return [style.animationName, style.animationIterationCount, style.animationDuration];
  });
  expect(animation).toEqual(['cr-empty-float', '3', '1.6s']);
  await expect(page.getByTestId('empty-plain').locator('[part="actions"]')).toHaveCount(0);
});

test('with reduced motion the illustration stays still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.getByTestId('empty-search').evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.illustration svg')!).animationName)).toBe('none');
});
