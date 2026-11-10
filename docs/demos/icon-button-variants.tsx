import { CrIconButton } from '@cristal/react';
import { Pencil, Settings, Share2, Trash2 } from 'lucide-react';

export default function IconButtonVariants() {
  return (
    <>
      <CrIconButton label="Modifier">
        <Pencil aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="Partager" variant="secondary">
        <Share2 aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="Paramètres" variant="outline" shape="round">
        <Settings aria-hidden="true" />
      </CrIconButton>
      <CrIconButton label="Supprimer" variant="primary">
        <Trash2 aria-hidden="true" />
      </CrIconButton>
    </>
  );
}
