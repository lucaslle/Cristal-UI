import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (file: string) => {
  const css = readFileSync(join(process.cwd(), 'node_modules/@cristal/react/dist', file), 'utf8');
  return [...css.matchAll(/(--cr-[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => ({ name, value }));
};
const files = { light: read('tokens.css'), dark: read('tokens-dark.css') };

export function TokenTable({ prefix, lang = 'en', theme = 'light' }: { prefix: string; lang?: string; theme?: 'light' | 'dark' }) {
  const tokens = files[theme];
  return (
    <table>
      <thead>
        <tr>
          <th>Variable</th>
          <th>{lang === 'fr' ? 'Valeur' : 'Value'}</th>
        </tr>
      </thead>
      <tbody>
        {tokens
          .filter((token) => token.name.startsWith(prefix))
          .map((token) => (
            <tr key={token.name}>
              <td>
                <code>{token.name}</code>
              </td>
              <td>
                <span className="inline-flex items-center gap-2">
                  {token.name.startsWith('--cr-color') && (
                    <span aria-hidden="true" className="inline-block size-4 rounded border" style={{ background: token.value }} />
                  )}
                  <code>{token.value}</code>
                </span>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
