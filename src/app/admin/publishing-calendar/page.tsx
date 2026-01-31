"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const PublishingCalendar = dynamic(
    () => import('@/components/admin/PublishingCalendar'),
    {
        loading: () => <LoadingSpinner />
    }
);

export default function Page() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <PublishingCalendar />
        </Suspense>
    );
}
