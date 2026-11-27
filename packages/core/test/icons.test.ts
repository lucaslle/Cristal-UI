import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { iconName } from '../src/icons/define';
import * as paths from '../src/icons/paths';

describe('icons', () => {
  it('names the HTML elements in kebab case', () => {
    expect(iconName('iconSearch')).toBe('search');
    expect(iconName('iconChevronDown')).toBe('chevron-down');
    expect(iconName('iconExternalLink')).toBe('external-link');
  });

  it('gives every icon its React component', () => {
    const react = readFileSync(new URL('../../react/src/icons.tsx', import.meta.url), 'utf8');
    for (const key of Object.keys(paths)) {
      const name = `CrIcon${key.slice('icon'.length)}`;
      expect(react).toContain(`export const ${name} = /* @__PURE__ */ icon('${name}', ${key});`);
    }
  });

  it('draws every icon inside the 24 × 24 grid', () => {
    for (const [key, ds] of Object.entries(paths)) {
      const absolute = ds.flatMap((d) => [...d.matchAll(/[ML]\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/g)].flatMap((m) => [Number(m[1]), Number(m[2])]));
      for (const value of absolute) {
        expect(value, key).toBeGreaterThanOrEqual(0);
        expect(value, key).toBeLessThanOrEqual(24);
      }
    }
  });
});
