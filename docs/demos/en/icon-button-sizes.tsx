import { CrIconButton } from '@cristal/react';
import { Plus } from 'lucide-react';

export default function IconButtonSizes() {
  return (
    <>
      {(['xs', 's', 'm', 'l'] as const).map((size) => (
        <CrIconButton key={size} label={`Add (${size.toUpperCase()})`} size={size} variant="secondary">
          <Plus aria-hidden="true" />
        </CrIconButton>
      ))}
    </>
  );
}
