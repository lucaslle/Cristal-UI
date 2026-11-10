'use client';

import { CrBox, CrButton, CrEmptyState } from '@cristal/react';

export default function EmptyStateBasic() {
  return (
    <CrBox display="flex" direction="column" gap="lg">
      <CrEmptyState heading="No products found" illustration="search">
        Try another word or remove some filters.
        <CrButton slot="actions" variant="outline">
          Remove filters
        </CrButton>
      </CrEmptyState>
      <CrEmptyState heading="No invoices" illustration="inbox">
        Your invoices will appear here after your first order.
        <CrButton slot="actions" href="/docs">
          Browse the catalogue
        </CrButton>
      </CrEmptyState>
      <CrEmptyState heading="Orders could not be loaded" illustration="error">
        The server is not responding. Try again in a moment.
        <CrButton slot="actions" variant="secondary">
          Try again
        </CrButton>
      </CrEmptyState>
    </CrBox>
  );
}
