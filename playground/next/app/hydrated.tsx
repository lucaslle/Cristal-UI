'use client';

import { useEffect } from 'react';

/** Pose data-hydrated sur <html> une fois la page hydratée par React : les tests e2e attendent ce signal avant d'agir. */
export function Hydrated() {
  useEffect(() => document.documentElement.setAttribute('data-hydrated', ''), []);
  return null;
}
