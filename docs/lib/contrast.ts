const toRgb = (color: string) => {
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 1, 1);
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
};

const luminance = (color: string) =>
  toRgb(color)
    .map((value) => value / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);

export const contrastRatio = (first: string, second: string) => {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};

export const resolvedColor = (element: Element, variable: string) => {
  const probe = document.createElement('span');
  probe.style.color = `var(${variable})`;
  element.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};
