import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

type Page = import('@playwright/test').Page;
const english = (page: Page) => page.getByTestId('english');

test('built-in texts follow the nearest lang: English section, French page', async ({ page, request }) => {
  const html = await (await request.get('/')).text();
  const stepper = html.slice(html.indexOf('<cr-stepper', html.indexOf('data-testid="english"')));
  const rendered = stepper.slice(0, stepper.indexOf('</cr-stepper>'));
  expect(rendered).toMatch(/>\s*Next\s*</);
  expect(rendered).not.toContain('Suivant');
  await expect(english(page).getByRole('button', { name: 'Next' })).toBeVisible();
  await expect(english(page).getByRole('button', { name: 'Previous' })).toBeDisabled();
  await expect(english(page).getByText('Account : current')).toBeAttached();
  await expect(english(page).getByRole('button', { name: /^Columns/ })).toBeVisible();
  await expect(english(page).getByText('2 of 2 columns · 0 pinned · normal rows')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tout ouvrir' })).toBeVisible();
});

test('validation and search messages are in English', async ({ page }) => {
  await english(page).getByRole('button', { name: 'Send' }).click();
  await expect(english(page).getByText('This field is required.')).toBeVisible();
  await english(page).getByRole('textbox', { name: 'Email' }).fill('nope');
  await english(page).getByRole('textbox', { name: 'Email' }).blur();
  await expect(english(page).getByText('Enter a valid email address, for example name@domain.com.')).toBeVisible();
  await english(page).getByRole('combobox', { name: 'Country' }).click();
  await expect(english(page).getByRole('searchbox', { name: 'Search the list' })).toBeFocused();
  await page.keyboard.type('zzz');
  await expect(english(page).getByText('No results')).toBeVisible();
});

test('stepper announces steps in English', async ({ page }) => {
  await english(page).getByRole('button', { name: 'Next' }).click();
  await expect(english(page).getByText('Step 2 of 2: Profile')).toBeAttached();
  await expect(english(page).getByRole('button', { name: 'Finish' })).toBeVisible();
});

test('without any lang, components default to English', async ({ page }) => {
  await page.evaluate(() => {
    document.documentElement.removeAttribute('lang');
    const dialog = document.createElement('cr-dialog');
    dialog.setAttribute('label', 'Default language');
    dialog.id = 'default-lang';
    document.body.append(dialog);
  });
  await page.evaluate(() => ((document.getElementById('default-lang') as HTMLCrDialogElement).open = true));
  await expect(page.getByRole('dialog', { name: 'Default language' }).getByRole('button', { name: 'Close' })).toBeVisible();
});
