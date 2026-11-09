import type { CSSProperties, ReactNode } from 'react';

export function Preview({ children, column = false, style }: { children: ReactNode; column?: boolean; style?: CSSProperties }) {
  return (
    <div
      className={`not-prose my-6 flex gap-4 rounded-xl border bg-[#f3f1f8] p-6 text-neutral-900 ${column ? 'flex-col items-stretch' : 'flex-wrap items-center'}`}
      style={{ colorScheme: 'light', ...style }}
    >
      {children}
    </div>
  );
}
