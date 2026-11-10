'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrAlert, CrToaster } from '@cristal/react';

const messages = {
  info: 'Une nouvelle version est disponible.',
  success: 'Modifications enregistrées.',
  danger: 'Envoi impossible : vérifiez votre connexion.',
} as const;

type Variant = keyof typeof messages;

export default function AlertToaster() {
  const [toasts, setToasts] = useState<{ id: number; variant: Variant }[]>([]);
  const show = (variant: Variant) => setToasts((list) => [...list, { id: Date.now(), variant }]);

  return (
    <CrBox display="flex" gap="sm">
      <CrButton variant="secondary" onClick={() => show('info')}>
        Information
      </CrButton>
      <CrButton onClick={() => show('success')}>Enregistrer</CrButton>
      <CrButton variant="outline" onClick={() => show('danger')}>
        Envoyer
      </CrButton>
      <CrToaster>
        {toasts.map(({ id, variant }) => (
          <CrAlert key={id} variant={variant} duration={variant === 'danger' ? 0 : 5000} onCrClose={() => setToasts((list) => list.filter((toast) => toast.id !== id))}>
            {messages[variant]}
          </CrAlert>
        ))}
      </CrToaster>
    </CrBox>
  );
}
