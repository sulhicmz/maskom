import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import DrillDashboard from '@/components/admin/DrillDashboard'
import DrillList from '@/components/admin/DrillList'
import DrillSchedule from '@/components/admin/DrillSchedule'
import DrillResultsComponent from '@/components/admin/DrillResults'
import { DrillType } from '@/types/drill'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { Permission } from '@/types/permission'

interface BackupDrillsPageProps {}

type TabType = 'dashboard' | 'list' | 'schedule'

export const runtime = 'nodejs'

export default function AdminBackupDrillsPage() {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [selectedDrillId, setSelectedDrillId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRunDrill = (drillId: string, backupId: string, drillType: DrillType) => {
    console.log('Running drill:', drillId, 'on backup:', backupId)
    alert(`Menjalankan latihan ulang untuk drill ${drillId}`)
    setRefreshKey(prev => prev + 1)
  }

  const handleCancelDrill = (drillId: string) => {
    if (confirm('Apakah Anda yakin ingin membatalkan latihan ini?')) {
      console.log('Cancelling drill:', drillId)
      alert(`Latihan ${drillId} telah dibatalkan`)
      setRefreshKey(prev => prev + 1)
    }
  }

  const handleViewResults = (drillId: string) => {
    setSelectedDrillId(drillId)
  }

  const handleCloseResults = () => {
    setSelectedDrillId(null)
  }

  const handleScheduleCreated = () => {
    setRefreshKey(prev => prev + 1)
    setActiveTab('list')
  }

  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_SETTINGS}>
      <div className={`container-fluid py-4 ${theme}`}>
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="nav nav-tabs" role="tablist">
                <button
                  className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dasbor
                </button>
                <button
                  className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
                  onClick={() => setActiveTab('list')}
                >
                  <i className="bi bi-list-ul me-2"></i>
                  Riwayat
                </button>
                <button
                  className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
                  onClick={() => setActiveTab('schedule')}
                >
                  <i className="bi bi-calendar-plus me-2"></i>
                  Jadwal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {activeTab === 'dashboard' && <DrillDashboard />}
          {activeTab === 'list' && (
            <DrillList
              key={refreshKey}
              onRunDrill={handleRunDrill}
              onCancelDrill={handleCancelDrill}
              onViewResults={handleViewResults}
            />
          )}
          {activeTab === 'schedule' && <DrillSchedule onScheduleCreated={handleScheduleCreated} />}
        </div>
      </div>

      {selectedDrillId && (
        <DrillResultsComponent
          drillId={selectedDrillId}
          onClose={handleCloseResults}
        />
      )}
        </div>
      </ProtectedRoute>
    </div>
  )
}
