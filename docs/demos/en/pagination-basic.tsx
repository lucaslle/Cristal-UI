'use client';

import { useState } from 'react';
import { CrBox, CrPagination } from '@cristal/react';

export default function PaginationBasic() {
  const [page, setPage] = useState(5);

  return (
    <CrBox display="flex" direction="column" gap="lg">
      <CrPagination page={7} total={42} href="/docs/composants/pagination?page={page}" />
      <CrPagination page={page} total={12} onCrChange={(event) => setPage(event.detail)} />
      <p>Page shown: {page}</p>
    </CrBox>
  );
}
