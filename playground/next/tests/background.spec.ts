import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

const block = (page: Page, variant: string) => page.getByTestId(`background-${variant}`);
const pause = (page: Page, variant: string) => block(page, variant).getByRole('button', { name: "Mettre en pause l'animation" });

/** États des animations CSS de la couche décorative. */
const playStates = (page: Page, variant: string) =>
  block(page, variant).evaluate((el) => [...new Set(el.shadowRoot!.querySelector('.layer')!.getAnimations({ subtree: true }).map((animation) => animation.playState))]);

/** Deux images du canvas, à 300 ms d'écart. */
const canvasFrames = (page: Page) =>
  block(page, 'particles').evaluate(async (el) => {
    const canvas = el.shadowRoot!.querySelector('canvas')!;
    const first = canvas.toDataURL();
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [first, canvas.toDataURL()];
  });

test('the animated layer is decorative and the content on top stays readable and clickable', async ({ page }) => {
  await page.goto('/');
  await block(page, 'aurora').scrollIntoViewIfNeeded();
  await expect(block(page, 'aurora').locator('.layer')).toHaveAttribute('aria-hidden', 'true');
  await expect(block(page, 'aurora')).toMatchAriaSnapshot(`
    - heading "Aurore" [level=3]
    - paragraph: Des halos de couleur qui dérivent lentement.
    - button "Découvrir aurore"
    - button "Mettre en pause l'animation" [pressed=false]
  `);
  for (const variant of ['aurora', 'gradient', 'grid', 'dots', 'waves', 'particles']) {
    await block(page, variant).getByRole('button', { name: /^Découvrir/ }).click();
  }
});

test('the pause button stops the CSS animations, and the play button starts them again', async ({ page }) => {
  await page.goto('/');
  await block(page, 'dots').scrollIntoViewIfNeeded();
  await expect.poll(() => playStates(page, 'dots')).toEqual(['running']);
  await pause(page, 'dots').click();
  await expect(pause(page, 'dots')).toHaveAttribute('aria-pressed', 'true');
  await expect(block(page, 'dots')).toHaveAttribute('paused', '');
  expect(await playStates(page, 'dots')).toEqual(['paused']);
  await pause(page, 'dots').click();
  await expect(pause(page, 'dots')).toHaveAttribute('aria-pressed', 'false');
  expect(await playStates(page, 'dots')).toEqual(['running']);
});

test('the particles stop drawing when paused', async ({ page }) => {
  await page.goto('/');
  await block(page, 'particles').scrollIntoViewIfNeeded();
  const [before, after] = await canvasFrames(page);
  expect(after).not.toBe(before);
  await pause(page, 'particles').click();
  await expect(pause(page, 'particles')).toHaveAttribute('aria-pressed', 'true');
  const [first, second] = await canvasFrames(page);
  expect(second).toBe(first);
});

test('a background off screen does not animate', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(300);
  expect(await playStates(page, 'waves')).toEqual(['paused']);
  await block(page, 'waves').scrollIntoViewIfNeeded();
  await expect.poll(() => playStates(page, 'waves')).toEqual(['running']);
});

test('with reduced motion, backgrounds start paused on a still frame and can be started', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await block(page, 'aurora').scrollIntoViewIfNeeded();
  await expect(pause(page, 'aurora')).toHaveAttribute('aria-pressed', 'true');
  expect(await playStates(page, 'aurora')).toEqual(['paused']);
  const [first, second] = await canvasFrames(page);
  expect(first).toBe(second);
  expect(first.length).toBeGreaterThan(5000);
  await pause(page, 'aurora').click();
  await expect.poll(() => playStates(page, 'aurora')).toEqual(['running']);
});

test('controls={false} leaves out the pause button', async ({ page }) => {
  await page.goto('/');
  await expect(block(page, 'no-controls').getByRole('button')).toHaveCount(0);
});

test('backgrounds hydrate without console errors, on a frame already in the server HTML', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  const html = await (await page.request.get('/')).text();
  expect(html).toMatch(/<cr-background[^>]*variant="aurora"[^>]*>\s*<template shadowrootmode="open">/);
  await page.goto('/');
  await block(page, 'particles').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

/** Densité d'encre du canvas autour du pointeur, rapportée à celle de tout le canvas, après 1,5 s de survol. */
const inkAroundPointer = (page: Page, testid: string) =>
  page.getByTestId(testid).evaluate(async (el) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const canvas = el.shadowRoot!.querySelector('canvas')!;
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    const ink = (x0: number, y0: number, size: number) => {
      let sum = 0;
      for (let y = y0; y < y0 + size; y++) for (let x = x0; x < x0 + size; x++) sum += data[(y * canvas.width + x) * 4 + 3];
      return sum / (size * size);
    };
    const size = Math.round(50 * (canvas.width / canvas.clientWidth));
    return ink(Math.round((canvas.width - size) / 2), Math.round((canvas.height - size) / 2), size) / ink(0, 0, Math.min(canvas.width, canvas.height));
  });

test('particles react to the pointer by default, not with interactive={false}', async ({ page }) => {
  await page.goto('/');
  const ratios: number[] = [];
  for (const testid of ['background-particles', 'background-still-particles']) {
    const target = page.getByTestId(testid);
    await target.scrollIntoViewIfNeeded();
    const box = (await target.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    ratios.push(await inkAroundPointer(page, testid));
  }
  // Les traits qui convergent vers le curseur concentrent l'encre autour de lui.
  expect(ratios[0]).toBeGreaterThan(2);
  expect(ratios[1]).toBeLessThan(2);
});
