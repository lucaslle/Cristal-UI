import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

const conditions = ['clear', 'rain', 'storm', 'fog', 'frost', 'heat', 'wind'];
const card = (page: Page, condition: string) => page.getByTestId(`weather-${condition}`);
const pause = (page: Page, condition: string) => card(page, condition).getByRole('button', { name: "Mettre en pause l'animation" });

/** Deux images du canvas à 300 ms d'écart, et la part de ses pixels qui ne sont pas transparents. */
const frames = (page: Page, condition: string) =>
  card(page, condition).evaluate(async (el) => {
    const canvas = el.shadowRoot!.querySelector('canvas')!;
    const first = canvas.toDataURL();
    await new Promise((resolve) => setTimeout(resolve, 300));
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let inked = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) inked++;
    return { first, second: canvas.toDataURL(), inked: inked / (canvas.width * canvas.height) };
  });

/** Opacité moyenne du canvas dans un carré de 40 pixels CSS autour de (x, y), coordonnées dans la carte. */
const inkAt = (page: Page, condition: string, x: number, y: number) =>
  card(page, condition).evaluate(
    (el, [x, y]) => {
      const canvas = el.shadowRoot!.querySelector('canvas')!;
      const ratio = canvas.width / canvas.clientWidth;
      const size = Math.round(40 * ratio);
      const data = canvas.getContext('2d')!.getImageData(Math.round(x * ratio - size / 2), Math.round(y * ratio - size / 2), size, size).data;
      let sum = 0;
      for (let i = 3; i < data.length; i += 4) sum += data[i];
      return sum / (size * size);
    },
    [x, y],
  );

/**
 * Contraste le plus faible, pixel par pixel, entre le texte de la carte et ce qu'il y a sous lui (verre, météo, fond vif),
 * sur une image prise en pleine animation puis figée : le texte est rendu transparent le temps de la capture.
 */
const worstContrast = async (page: Page, condition: string) => {
  const target = card(page, condition);
  await target.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await pause(page, condition).click();
  const boxes = await target.evaluate((el) =>
    [...el.querySelectorAll<HTMLElement>('h3, p, a')].map((text) => {
      const box = text.getBoundingClientRect();
      const color = getComputedStyle(text).color;
      text.style.color = 'transparent';
      return { color, x: box.x, y: box.y, width: box.width, height: box.height };
    }),
  );
  const shot = (await page.screenshot()).toString('base64');
  await target.evaluate((el) => el.querySelectorAll<HTMLElement>('h3, p, a').forEach((text) => (text.style.color = '')));
  return page.evaluate(
    async ({ shot, boxes }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${shot}`;
      await image.decode();
      const context = Object.assign(document.createElement('canvas'), { width: image.width, height: image.height }).getContext('2d')!;
      context.drawImage(image, 0, 0);
      const channel = (value: number) => ((value /= 255) <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
      const luminance = (r: number, g: number, b: number) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      let worst = Infinity;
      for (const box of boxes) {
        const [r, g, b] = box.color.match(/\d+/g)!.map(Number);
        const text = luminance(r, g, b);
        const data = context.getImageData(Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)).data;
        for (let i = 0; i < data.length; i += 4) {
          const under = luminance(data[i], data[i + 1], data[i + 2]);
          worst = Math.min(worst, (Math.max(under, text) + 0.05) / (Math.min(under, text) + 0.05));
        }
      }
      return worst;
    },
    { shot, boxes },
  );
};

for (const theme of ['light', 'dark']) {
  test(`text on the glass keeps 4.5:1 on every pixel, mid-animation, for every condition (${theme} theme)`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate((value) => (document.documentElement.dataset.theme = value), theme);
    for (const condition of conditions) expect(await worstContrast(page, condition), condition).toBeGreaterThanOrEqual(4.5);
  });
}

test('the weather layer is decorative and the content on the glass stays readable and clickable', async ({ page }) => {
  await page.goto('/');
  await card(page, 'rain').scrollIntoViewIfNeeded();
  await expect(card(page, 'rain').locator('.layer')).toHaveAttribute('aria-hidden', 'true');
  await expect(card(page, 'rain').locator('.layer').locator('button, a, [tabindex]')).toHaveCount(0);
  await expect(card(page, 'rain')).toMatchAriaSnapshot(`
    - heading "Lyon" [level=3]
    - paragraph: Jeudi 12 novembre
    - paragraph: 14°
    - paragraph: Pluie fine
    - paragraph: Humidité 82 %, vent 12 km/h
    - link "Prévisions à 7 jours"
    - button "Mettre en pause l'animation" [pressed=false]
  `);
  for (const condition of conditions) {
    await card(page, condition).getByRole('link').click();
    await expect(page).toHaveURL(/#meteo$/);
  }
});

test('every condition draws on the glass and animates', async ({ page }) => {
  await page.goto('/');
  for (const condition of conditions) {
    await card(page, condition).scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const { first, second, inked } = await frames(page, condition);
    expect(inked, condition).toBeGreaterThan(0.01);
    expect(second, condition).not.toBe(first);
  }
});

test('with reduced motion, every card starts paused on a still frame that is not blank, and can be started', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const condition of conditions) {
    await card(page, condition).scrollIntoViewIfNeeded();
    await expect(pause(page, condition)).toHaveAttribute('aria-pressed', 'true');
    const { first, second, inked } = await frames(page, condition);
    expect(second, condition).toBe(first);
    expect(inked, condition).toBeGreaterThan(0.01);
  }
  await pause(page, 'frost').click();
  await expect(card(page, 'frost')).not.toHaveAttribute('paused');
  const { first, second } = await frames(page, 'frost');
  expect(second).not.toBe(first);
});

test('the pause button stops the drawing, and the play button starts it again', async ({ page }) => {
  await page.goto('/');
  await card(page, 'storm').scrollIntoViewIfNeeded();
  await pause(page, 'storm').click();
  await expect(pause(page, 'storm')).toHaveAttribute('aria-pressed', 'true');
  await expect(card(page, 'storm')).toHaveAttribute('paused', '');
  const still = await frames(page, 'storm');
  expect(still.second).toBe(still.first);
  await pause(page, 'storm').click();
  await expect(pause(page, 'storm')).toHaveAttribute('aria-pressed', 'false');
  const moving = await frames(page, 'storm');
  expect(moving.second).not.toBe(moving.first);
});

test('changing the condition cross-fades to the new effect without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await card(page, 'clear').scrollIntoViewIfNeeded();
  for (const condition of [...conditions.slice(1), 'clear']) {
    await card(page, 'clear').evaluate((el, value) => el.setAttribute('condition', value), condition);
    // En plein fondu, le verre n'est jamais vide.
    await page.waitForTimeout(250);
    expect((await frames(page, 'clear')).inked, condition).toBeGreaterThan(0.01);
  }
  await expect(card(page, 'clear')).toHaveAttribute('condition', 'clear');
  // Aussi en pause : le nouvel effet est dessiné tout de suite, sur une image fixe.
  await pause(page, 'clear').click();
  await expect(card(page, 'clear')).toHaveAttribute('paused', '');
  await card(page, 'clear').evaluate((el) => el.setAttribute('condition', 'frost'));
  // Le rendu qui suit un changement d'attribut est asynchrone.
  await page.waitForTimeout(100);
  const { first, second, inked } = await frames(page, 'clear');
  expect(second).toBe(first);
  expect(inked).toBeGreaterThan(0.01);
  expect(errors).toEqual([]);
});

test('a card off screen does not animate', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(300);
  const offscreen = await frames(page, 'wind');
  expect(offscreen.second).toBe(offscreen.first);
  await card(page, 'wind').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const onscreen = await frames(page, 'wind');
  expect(onscreen.second).not.toBe(onscreen.first);
});

test('the pointer wipes the fog under it', async ({ page }) => {
  await page.goto('/');
  await card(page, 'fog').scrollIntoViewIfNeeded();
  // En pause, seul le doigt change le verre : la buée ne dérive pas pendant la mesure.
  await pause(page, 'fog').click();
  await expect(card(page, 'fog')).toHaveAttribute('paused', '');
  // Laisse passer l'image déjà demandée avant la pause : elle ferait encore dériver la buée pendant la mesure.
  await card(page, 'fog').evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const box = (await card(page, 'fog').boundingBox())!;
  const [x, y] = [box.width / 2, box.height / 2];
  const before = await inkAt(page, 'fog', x, y);
  const corner = await inkAt(page, 'fog', 30, 30);
  await page.mouse.move(box.x + x - 60, box.y + y);
  await page.mouse.move(box.x + x + 60, box.y + y, { steps: 12 });
  expect(await inkAt(page, 'fog', x, y)).toBeLessThan(before * 0.5);
  expect(await inkAt(page, 'fog', 30, 30)).toBe(corner);
});

test('controls={false} leaves out the pause button', async ({ page }) => {
  await page.goto('/');
  await expect(card(page, 'no-controls').getByRole('button')).toHaveCount(0);
});

test('weather cards hydrate without console errors, with their glass already in the server HTML', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  const html = await (await page.request.get('/')).text();
  expect(html).toMatch(/<cr-weather[^>]*condition="rain"[^>]*>\s*<template shadowrootmode="open">/);
  await page.goto('/');
  await card(page, 'fog').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});
