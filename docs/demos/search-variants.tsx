import { CrBox, CrSearch } from '@cristal/react';

const variants = ['outline', 'filled', 'underline', 'expand'] as const;

export default function SearchVariants() {
  return (
    <CrBox display="flex" direction="column" gap="xl" style={{ width: '100%', maxWidth: 420 }}>
      {variants.map((variant) => (
        <CrSearch key={variant} variant={variant} label={`Rechercher, style ${variant}`} placeholder="Rechercher" />
      ))}
    </CrBox>
  );
}
