'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrToast, CrToaster } from '@cristal/react';

const messages = {
  info: 'A new version is available.',
  success: 'Changes saved.',
  danger: 'Sending failed: check your connection.',
} as const;

type Variant = keyof typeof messages;

export default function ToastBasic() {
  const [toasts, setToasts] = useState<{ id: number; variant: Variant }[]>([]);
  const show = (variant: Variant) => setToasts((list) => [...list, { id: Date.now(), variant }]);

  return (
    <CrBox display="flex" gap="sm">
      <CrButton variant="secondary" onClick={() => show('info')}>
        Information
      </CrButton>
      <CrButton onClick={() => show('success')}>Save</CrButton>
      <CrButton variant="outline" onClick={() => show('danger')}>
        Send
      </CrButton>
      <CrToaster>
        {toasts.map(({ id, variant }) => (
          <CrToast key={id} open variant={variant} duration={variant === 'danger' ? 0 : 5000} onCrClose={() => setToasts((list) => list.filter((toast) => toast.id !== id))}>
            {messages[variant]}
          </CrToast>
        ))}
      </CrToaster>
    </CrBox>
  );
}
