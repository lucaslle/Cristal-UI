'use client';

import { useState } from 'react';
import { CrButton, CrToast, CrToaster } from '@cristal/react';

interface Toast {
  id: number;
  variant: 'success' | 'danger';
  text: string;
}

export function ToastDemo() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [closed, setClosed] = useState(0);
  const add = (variant: Toast['variant'], text: string) => setToasts((list) => [...list, { id: Date.now(), variant, text }]);
  const remove = (id: number) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
    setClosed((count) => count + 1);
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--cr-spacing-sm)', alignItems: 'center' }}>
      <CrButton onClick={() => add('success', 'Modifications enregistrées.')}>Enregistrer la fiche</CrButton>
      <CrButton variant="secondary" onClick={() => add('danger', 'Synchronisation impossible : vérifiez votre connexion.')}>
        Synchroniser
      </CrButton>
      <span data-testid="toast-closed">{closed}</span>
      <CrToaster>
        {toasts.map((toast) => (
          <CrToast key={toast.id} open variant={toast.variant} duration={toast.variant === 'danger' ? 0 : 2000} onCrClose={() => remove(toast.id)}>
            {toast.text}
          </CrToast>
        ))}
      </CrToaster>
    </div>
  );
}
