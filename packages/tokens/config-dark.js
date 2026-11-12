import StyleDictionary from 'style-dictionary';
import { formats } from 'style-dictionary/enums';

const cssVariables = StyleDictionary.hooks.formats[formats.cssVariables];

// Thème sombre opt-in : les seules valeurs qui changent, plus color-scheme pour les contrôles natifs et les barres de défilement.
export default {
  source: ['dark/**/*.json'],
  hooks: {
    formats: {
      'css/dark': async (args) => (await cssVariables(args)).replace('{\n', '{\n  color-scheme: dark;\n'),
    },
  },
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'cr',
      buildPath: 'build/',
      files: [
        {
          destination: 'tokens-dark.css',
          format: 'css/dark',
          options: { outputReferences: true, selector: ":root[data-theme='dark'], .cr-theme-dark" },
        },
      ],
    },
  },
};
