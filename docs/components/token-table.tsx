import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'node_modules/@cristal/react/dist/tokens.css'), 'utf8');
const tokens = [...css.matchAll(/(--cr-[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => ({ name, value }));

export function TokenTable({ prefix, lang = 'en' }: { prefix: string; lang?: string }) {
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
                  {prefix === '--cr-color' && (
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
