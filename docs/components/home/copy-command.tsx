'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyCommand({ command, label, done }: { command: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="glass-dark flex max-w-full items-center gap-3 py-2 pl-4 pr-2 font-mono text-sm">
      <span aria-hidden="true" className="stage-muted">
        $
      </span>
      <code className="overflow-x-auto whitespace-nowrap text-violet-50">{command}</code>
      <button type="button" onClick={copy} className="rounded-lg p-2 text-violet-100 hover:bg-white/10" aria-label={label}>
        {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      </button>
      <span role="status" className="sr-only">
        {copied ? done : ''}
      </span>
    </div>
  );
}
