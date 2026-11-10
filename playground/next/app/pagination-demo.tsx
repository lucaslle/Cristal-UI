'use client';

import { useState } from 'react';
import { CrPagination } from '@cristal/react';

export function PaginationDemo() {
  const [page, setPage] = useState(1);

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)' }}>
      <CrPagination data-testid="pagination-links" page={5} total={20} href="/?page={page}" />
      <CrPagination data-testid="pagination-buttons" page={page} total={8} onCrChange={(event) => setPage(event.detail)} />
      <p data-testid="pagination-page">{page}</p>
    </div>
  );
}
