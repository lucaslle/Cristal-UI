import { CrIconButton } from '@cristal/react';
import { Pencil, Settings, Share2, Trash2 } from 'lucide-react';

export default function IconButtonVariants() {
  return (
    <>
      <CrIconButton label="Edit">
        <Pencil aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="Share" variant="secondary">
        <Share2 aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="Settings" variant="outline" shape="round">
        <Settings aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="Delete" variant="primary">
        <Trash2 aria-hidden="true" />
      </CrIconButton>
    </>
  );
}
