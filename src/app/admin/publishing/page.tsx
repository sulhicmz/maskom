"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const PublishingDashboard = dynamic(
    () => import('@/components/admin/PublishingDashboard'),
    {
        loading: () => <LoadingSpinner />
    }
);

export default function Page() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <PublishingDashboard />
        </Suspense>
    );
}
