'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/admin-ui/button';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import type { CollectionStatus } from '../lib/remoteCollection';
import { EmptyState } from './EmptyState';

type Props = { status: CollectionStatus; onRetry: () => void; children: ReactNode };

/** Holds back a collection view until the API answered, so "empty" never flashes while loading. */
export function CollectionState({ status, onRetry, children }: Props) {
  const { common } = useDictionary().admin;

  if (status === 'loading') {
    return (
      <div className="mx-auto grid w-full max-w-4xl gap-4" aria-busy="true">
        <div className="bg-muted h-9 w-48 animate-pulse rounded-xl" />
        <div className="bg-muted h-96 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="grid justify-items-center gap-4">
        <EmptyState title={common.loadFailed} />
        <Button variant="outline" onClick={onRetry}>
          {common.retry}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
