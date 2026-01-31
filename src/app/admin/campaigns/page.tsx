import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CampaignList = dynamic(
  () => import('@/components/admin/CampaignList'),
  { loading: () => <LoadingSpinner /> }
);

export const runtime = 'nodejs'

export default function AdminCampaignsPage() {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <CampaignList />
      </Suspense>
    );
}
