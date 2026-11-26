// Next.js Cache Components abort a prerender on every Date/Math.random read, and the Stencil
// hydrate script reads both on each render (build id, mock events, mock performance, component
// code). Server output is a snapshot the client re-renders on hydration, so the hydrate script
// gets its own Date (clock from performance, which Next does not track) and a seeded Math.random.
import { readFileSync, writeFileSync } from 'node:fs';

const marker = '/* cristal: untracked hydrate io */';
const prelude = `${marker}
const Date = (() => {
  const RealDate = globalThis.Date;
  const now = () => Math.floor(performance.timeOrigin + performance.now());
  function Date(...args) {
    if (!new.target) return new RealDate(now()).toString();
    return args.length ? new RealDate(...args) : new RealDate(now());
  }
  Date.prototype = RealDate.prototype;
  Date.now = now;
  return Object.setPrototypeOf(Date, RealDate);
})();
const Math = (() => {
  let seed = 1;
  // mulberry32
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = globalThis.Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + globalThis.Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Object.create(globalThis.Math, { random: { value: random } });
})();
`;

for (const file of ['hydrate/index.mjs', 'hydrate/index.js']) {
  const src = readFileSync(file, 'utf8');
  if (src.includes(marker)) continue;
  // after 'use strict' so the CommonJS build stays strict
  writeFileSync(file, src.replace(/^('use strict';\n)?/, (strict) => strict + prelude));
}
