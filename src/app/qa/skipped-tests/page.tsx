import { Suspense } from 'react';
import SkippedTestDashboard from '@/components/qa/SkippedTestDashboard';

export const metadata = {
  title: 'Skipped Test Diagnostics | QA',
  description: 'Diagnostic dashboard for skipped tests with categorization and recommendations',
};

export default function SkippedTestsPage() {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<div>Memuat diagnostik tes yang diabaikan...</div>}>
        <SkippedTestDashboard />
      </Suspense>
    </div>
  );
}
