'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PersonalizationPerformanceAlertsDashboard from '@/components/admin/PersonalizationPerformanceAlertsDashboard';

export default function Page() {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return (
      <div className="min-vh-100 py-5 bg-light text-dark">
        <div className="container">
          <div className="alert alert-warning">
            <h4>Akses Ditolak</h4>
            <p>Silakan login untuk mengakses halaman ini.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermission('MANAGE_ANALYTICS')) {
    return (
      <div className="min-vh-100 py-5 bg-light text-dark">
        <div className="container">
          <div className="alert alert-danger">
            <h4>Akses Ditolak</h4>
            <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        </div>
      </div>
    );
  }

  return <PersonalizationPerformanceAlertsDashboard />;
}
