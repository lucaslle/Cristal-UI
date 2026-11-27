import { expect, test } from './fixtures';

test('renders header and footer only when they are provided', async ({ page }) => {
  await page.goto('/');
  const [full, bare] = [page.locator('cr-card').nth(0), page.locator('cr-card').nth(1)];
  await expect(full.locator('[part="header"]')).toHaveCount(1);
  await expect(full.locator('[part="footer"]')).toHaveCount(1);
  await expect(bare.locator('[part="header"]')).toHaveCount(0);
  await expect(bare.locator('[part="footer"]')).toHaveCount(0);
});
