import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

const unread = (page: Page) => page.getByTestId('badge-unread');

/** Relève les chiffres affichés à chaque image pendant 800 ms après le clic. */
const digitsAfterClick = (page: Page) =>
  unread(page).evaluate(async (el) => {
    const seen: string[] = [];
    const end = performance.now() + 800;
    await new Promise<void>((resolve) => {
      const tick = () => {
        seen.push(el.shadowRoot!.querySelector('.digits')!.textContent!);
        if (performance.now() < end) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    return [...new Set(seen)];
  });

test('a badge reads as its text and its count; only live badges are status regions', async ({ page }) => {
  await page.goto('/');
  await expect(unread(page)).toMatchAriaSnapshot('- status: Non lus 3');
  await expect(page.getByTestId('badge-drafts')).toMatchAriaSnapshot('- text: Brouillons 12');
  await expect(page.getByTestId('badge-drafts')).not.toHaveAttribute('role');
});

test('a new count rolls through the numbers in between, while screen readers get the final one', async ({ page }) => {
  await page.goto('/');
  const sampling = digitsAfterClick(page);
  await page.getByRole('button', { name: 'Recevoir 5 messages' }).click();
  const seen = await sampling;
  expect(seen[seen.length - 1]).toBe('8');
  expect(seen.some((digits) => ['4', '5', '6', '7'].includes(digits))).toBe(true);
  await expect(unread(page).locator('.sr-only')).toHaveText('8');
  await expect(unread(page).locator('.digits')).toHaveAttribute('data-direction', 'up');
});

test('with reduced motion, the count jumps straight to its new value', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const sampling = digitsAfterClick(page);
  await page.getByRole('button', { name: 'Recevoir 5 messages' }).click();
  expect(await sampling).toEqual(['3', '8']);
  expect(await unread(page).locator('.digits').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});
