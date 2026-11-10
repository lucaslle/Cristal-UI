import type { CSSProperties, ReactNode } from 'react';

export function Preview({ children, column = false, style }: { children: ReactNode; column?: boolean; style?: CSSProperties }) {
  return (
    <div
      className={`not-prose my-6 flex gap-4 preview-frame p-6 ${column ? 'flex-col items-stretch' : 'flex-wrap items-center'}`}
      style={style}
    >
      {children}
    </div>
  );
}
