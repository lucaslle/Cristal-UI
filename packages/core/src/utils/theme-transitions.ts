export type ThemeTransition = 'circle' | 'curtain' | 'blinds' | 'flip' | 'eclipse' | 'sweep' | 'none';

/** Une animation à jouer sur une image de la transition de vue : l'ancien thème (old), le nouveau (new) ou le fond derrière les deux (backdrop). */
export type Layer = { pseudo: 'old' | 'new' | 'backdrop'; keyframes: Keyframe[]; options: KeyframeAnimationOptions };

type Origin = { x: number; y: number; width: number; height: number };

// Les deux images sont opaques et posées l'une sur l'autre : sans fondu ni mélange, seule la forme animée dit où est le nouveau thème.
const still: Keyframe = { opacity: 1, mixBlendMode: 'normal' };
const at = (keyframes: Keyframe[]) => keyframes.map((frame) => ({ ...still, ...frame }));
const frames = (count: number, frame: (progress: number) => Keyframe) => at(Array.from({ length: count + 1 }, (_, index) => frame(index / count)));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const px = (value: number) => `${value.toFixed(1)}px`;

/** Le nouveau thème s'ouvre en cercle depuis le centre du bouton jusqu'au coin le plus éloigné. */
const circle = ({ x, y, width, height }: Origin): Layer[] => {
  const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
  return [
    { pseudo: 'old', keyframes: at([{}, {}]), options: { duration: 700 } },
    {
      pseudo: 'new',
      keyframes: at([{ clipPath: `circle(0px at ${px(x)} ${px(y)})` }, { clipPath: `circle(${px(radius)} at ${px(x)} ${px(y)})` }]),
      options: { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
    },
  ];
};

/** Le nouveau thème tombe du haut comme un rideau, rebondit un peu et projette son ombre sur l'ancien, qui s'assombrit dessous. */
const curtain = (): Layer[] => [
  { pseudo: 'old', keyframes: at([{ filter: 'brightness(1)' }, { filter: 'brightness(0.55)' }]), options: { duration: 900, easing: 'ease-in' } },
  {
    pseudo: 'new',
    keyframes: at([
      { transform: 'translateY(-100%)', filter: 'drop-shadow(0 24px 32px rgb(0 0 0 / 0.45))', easing: 'cubic-bezier(0.55, 0, 0.85, 0.35)' },
      { offset: 0.72, transform: 'translateY(0)', filter: 'drop-shadow(0 24px 32px rgb(0 0 0 / 0.45))', easing: 'ease-out' },
      { offset: 0.86, transform: 'translateY(-2.5%)', filter: 'drop-shadow(0 16px 24px rgb(0 0 0 / 0.3))', easing: 'ease-in' },
      { transform: 'translateY(0)', filter: 'drop-shadow(0 0 0 rgb(0 0 0 / 0))' },
    ]),
    options: { duration: 900 },
  },
];

/** Bandes horizontales qui basculent l'une après l'autre, de haut en bas : chacune se remplit vers le bas, avec un décalage. */
const blinds = ({ width, height }: Origin): Layer[] => {
  const count = 9;
  const band = height / count;
  const stagger = 0.55 / (count - 1);
  const polygon = (progress: number) => {
    const points: string[] = [];
    for (let index = 0; index < count; index++) {
      const top = index * band;
      const bottom = top + band * easeInOut(clamp01((progress - index * stagger) / 0.45));
      // Chaque bande est reliée à la suivante par un aller-retour sur le bord gauche, sans surface : un seul polygone suffit.
      points.push(`0 ${px(top)}`, `${px(width)} ${px(top)}`, `${px(width)} ${px(bottom)}`, `0 ${px(bottom)}`);
    }
    return { clipPath: `polygon(${points.join(', ')})` };
  };
  return [
    { pseudo: 'old', keyframes: at([{}, {}]), options: { duration: 1000 } },
    { pseudo: 'new', keyframes: frames(40, polygon), options: { duration: 1000 } },
  ];
};

/** La page tourne en 3D autour de son axe vertical : son dos est l'autre thème. */
const flip = (): Layer[] => {
  const turn = (from: number, to: number): Keyframe[] =>
    at([
      { transform: `perspective(2000px) rotateY(${from}deg) scale(1)`, backfaceVisibility: 'hidden' },
      { offset: 0.5, transform: `perspective(2000px) rotateY(${(from + to) / 2}deg) scale(0.8)`, backfaceVisibility: 'hidden' },
      { transform: `perspective(2000px) rotateY(${to}deg) scale(1)`, backfaceVisibility: 'hidden' },
    ]);
  const options = { duration: 1100, easing: 'cubic-bezier(0.6, 0, 0.4, 1)' };
  return [
    // Fond neutre derrière la page qui tourne : le relief se lit dans les deux sens, clair vers sombre comme sombre vers clair.
    { pseudo: 'backdrop', keyframes: [{ backgroundColor: '#2b2640' }, { backgroundColor: '#2b2640' }], options: { duration: 1100 } },
    { pseudo: 'old', keyframes: turn(0, 180), options },
    { pseudo: 'new', keyframes: turn(-180, 0), options },
  ];
};

/** Un disque immense au bord flou part de derrière le bouton et glisse à travers l'écran, comme l'ombre d'une éclipse. */
const eclipse = ({ x, y, width, height }: Origin): Layer[] => {
  const radius = Math.hypot(width, height);
  const distance = Math.hypot(width / 2 - x, height / 2 - y) || 1;
  const [ux, uy] = [(width / 2 - x) / distance, (height / 2 - y) / distance];
  // Le disque avance le long de u : il s'arrête dès qu'il couvre le coin le plus difficile à atteindre.
  const corners = [[0, 0], [width, 0], [0, height], [width, height]];
  const travel = Math.max(
    ...corners.map(([cx, cy]) => {
      const along = (cx - x) * ux + (cy - y) * uy;
      const across = Math.hypot(cx - x, cy - y) ** 2 - along ** 2;
      return along - Math.sqrt(Math.max(0, radius ** 2 - across));
    }),
  );
  const position = (shift: number) => `${px(x + ux * shift - radius)} ${px(y + uy * shift - radius)}`;
  const disc = { maskImage: 'radial-gradient(closest-side, #000 calc(100% - 64px), transparent)', maskSize: `${px(2 * radius)} ${px(2 * radius)}`, maskRepeat: 'no-repeat' };
  return [
    { pseudo: 'old', keyframes: at([{ filter: 'brightness(1)' }, { offset: 0.6, filter: 'brightness(0.6)' }, { filter: 'brightness(0.6)' }]), options: { duration: 1200 } },
    {
      pseudo: 'new',
      keyframes: at([
        { ...disc, maskPosition: position(-radius) },
        { ...disc, maskPosition: position(travel + 64) },
      ]),
      options: { duration: 1200, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
    },
  ];
};

/** Le nouveau thème balaie l'écran comme une aiguille d'horloge, partie de midi, autour du centre. */
const sweep = ({ width, height }: Origin): Layer[] => {
  const [cx, cy] = [width / 2, height / 2];
  const radius = Math.hypot(width, height) * 0.6;
  const steps = 32;
  const wedge = (progress: number) => {
    const angle = 2 * Math.PI * easeInOut(progress);
    const arc = Array.from({ length: steps + 1 }, (_, index) => {
      const a = (angle * index) / steps;
      return `${px(cx + radius * Math.sin(a))} ${px(cy - radius * Math.cos(a))}`;
    });
    return { clipPath: `polygon(${px(cx)} ${px(cy)}, ${arc.join(', ')})` };
  };
  return [
    { pseudo: 'old', keyframes: at([{}, {}]), options: { duration: 1000 } },
    { pseudo: 'new', keyframes: frames(40, wedge), options: { duration: 1000 } },
  ];
};

const builders: Record<Exclude<ThemeTransition, 'none'>, (origin: Origin) => Layer[]> = { circle, curtain, blinds, flip, eclipse, sweep };

/** Les animations d'une transition, à jouer sur ::view-transition-old(root) et ::view-transition-new(root). */
export const themeTransition = (kind: Exclude<ThemeTransition, 'none'>, origin: Origin): Layer[] => (builders[kind] ?? circle)(origin);
