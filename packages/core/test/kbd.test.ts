import { describe, expect, it } from 'vitest';
import { keyFaces } from '../src/utils/kbd';
import { en } from '../src/utils/messages-en';

describe('keyFaces', () => {
  it('turns Mod into Ctrl outside a Mac and uppercases a single letter', () => {
    expect(keyFaces('Mod+k', false, en)).toEqual([{ shown: 'Ctrl' }, { shown: 'K' }]);
  });

  it('draws Mac symbols with a spoken name', () => {
    expect(keyFaces('Mod+Alt+Shift+P', true, en)).toEqual([
      { shown: '⌘', spoken: 'Command' },
      { shown: '⌥', spoken: 'Option' },
      { shown: '⇧', spoken: 'Shift' },
      { shown: 'P' },
    ]);
  });

  it('keeps named keys as written and ignores empty parts', () => {
    expect(keyFaces(' Ctrl + Enter ', false, en)).toEqual([{ shown: 'Ctrl' }, { shown: 'Enter' }]);
  });
});
