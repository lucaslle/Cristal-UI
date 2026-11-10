import { CrSegmented } from '@cristal/react';

export default function SegmentedFit() {
  return (
    <CrSegmented label="Affichage" fit value="all">
      <option value="all">Tout</option>
      <option value="unread">Non lus</option>
      <option value="mentions">Mentions</option>
      <option value="archived" disabled>
        Archivés
      </option>
    </CrSegmented>
  );
}
