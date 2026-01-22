"use client"

import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { toast } from 'react-toastify'

const PrivacySettingsSection: React.FC = () => {
    const { theme } = useTheme()
    const [deleting, setDeleting] = useState(false)
    const [exporting, setExporting] = useState(false)

    const handleExportData = async () => {
        setExporting(true)
        try {
            const { exportUserData } = await import('@/utils/dashboardUtils')
            const data = exportUserData()
            
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            
            toast.success('Data berhasil diekspor')
        } catch (error) {
            console.error('Failed to export data:', error)
            toast.error('Gagal mengekspor data')
        } finally {
            setExporting(false)
        }
    }

    const handleDeleteData = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus semua data dashboard? Tindakan ini tidak dapat dibatalkan.')) {
            return
        }

        setDeleting(true)
        try {
            const { deleteUserData } = await import('@/utils/dashboardUtils')
            deleteUserData()
            toast.success('Data berhasil dihapus')
        } catch (error) {
            console.error('Failed to delete data:', error)
            toast.error('Gagal menghapus data')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="card mb-4">
            <div className="card-header">
                <h5 className="card-title mb-0">
                    <span className="section-icon">🔒</span>
                    Pengaturan Privasi
                </h5>
            </div>
            <div className="card-body">
                <div className="privacy-options">
                    <div className="privacy-option">
                        <h6>Ekspor Data</h6>
                        <p className="text-muted">
                            Unduh semua data dashboard Anda dalam format JSON. 
                            Data ini mencakup riwayat bacaan, bookmark, statistik, dan pengaturan.
                        </p>
                        <button
                            className="btn btn-outline-primary"
                            onClick={handleExportData}
                            disabled={exporting}
                        >
                            {exporting ? 'Mengekspor...' : 'Ekspor Data'}
                        </button>
                    </div>

                    <div className="privacy-option danger-zone">
                        <h6>Hapus Data</h6>
                        <p className="text-muted">
                            Hapus semua data dashboard dari perangkat ini. 
                            Tindakan ini tidak dapat dibatalkan dan akan menghapus:
                        </p>
                        <ul className="danger-list">
                            <li>Riwayat bacaan</li>
                            <li>Bookmark</li>
                            <li>Statistik keterlibatan</li>
                            <li>Feed aktivitas</li>
                            <li>Pengaturan akun</li>
                        </ul>
                        <button
                            className="btn btn-outline-danger"
                            onClick={handleDeleteData}
                            disabled={deleting}
                        >
                            {deleting ? 'Menghapus...' : 'Hapus Semua Data'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrivacySettingsSection
