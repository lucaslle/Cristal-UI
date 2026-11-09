import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';

export const config: Config = {
  namespace: 'cristal',
  outputTargets: [
    { type: 'dist', esmLoaderPath: '../loader' },
    { type: 'dist-custom-elements', externalRuntime: false, customElementsExportBehavior: 'single-export-module' },
    { type: 'dist-hydrate-script', dir: 'hydrate' },
    { type: 'docs-json', file: '../../docs/generated/components.json' },
    reactOutputTarget({
      outDir: '../react/src/generated/',
      hydrateModule: '@cristal/core/hydrate',
      clientModule: '@cristal/react',
    }),
  ],
};
