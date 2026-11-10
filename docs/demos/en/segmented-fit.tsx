import { CrSegmented } from '@cristal/react';

export default function SegmentedFit() {
  return (
    <CrSegmented label="View" fit value="all">
      <option value="all">All</option>
      <option value="unread">Unread</option>
      <option value="mentions">Mentions</option>
      <option value="archived" disabled>
        Archived
      </option>
    </CrSegmented>
  );
}
