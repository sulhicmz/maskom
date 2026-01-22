"use client"

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { ReadingHistoryEntry } from '@/types/dashboard'
import { loadDashboardData } from '@/utils/dashboardUtils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-toastify'

const ReadingHistorySection: React.FC = () => {
    const { theme } = useTheme()
    const [history, setHistory] = useState<ReadingHistoryEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadHistory = () => {
            try {
                const dashboardData = loadDashboardData()
                if (dashboardData) {
                    const sortedHistory = [...dashboardData.readingHistory].sort(
                        (a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime()
                    )
                    setHistory(sortedHistory)
                }
            } catch (error) {
                console.error('Failed to load reading history:', error)
                toast.error('Gagal memuat riwayat bacaan')
            } finally {
                setLoading(false)
            }
        }
        loadHistory()
    }, [])

    if (loading) {
        return <LoadingSpinner minHeight={200} color="primary" />
    }

    if (history.length === 0) {
        return (
            <div className="card mb-4">
                <div className="card-body text-center py-5">
                    <div className="empty-state">
                        <span className="empty-icon">📚</span>
                        <h5>Belum ada riwayat bacaan</h5>
                        <p className="text-muted">Mulai membaca postingan untuk melihat riwayat</p>
                    </div>
                </div>
            </div>
        )
    }

    const groupedByDate = history.reduce((groups: { [key: string]: ReadingHistoryEntry[] }, entry) => {
        const dateKey = new Date(entry.readAt).toLocaleDateString('id-ID', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
        if (!groups[dateKey]) {
            groups[dateKey] = []
        }
        groups[dateKey].push(entry)
        return groups
    }, {})

    return (
        <div className="card mb-4">
            <div className="card-header">
                <h5 className="card-title mb-0">
                    <span className="section-icon">📚</span>
                    Riwayat Bacaan
                </h5>
            </div>
            <div className="card-body">
                <div className="timeline-view">
                    {Object.entries(groupedByDate).map(([date, entries]) => (
                        <div key={date} className="timeline-day">
                            <h6 className="timeline-date">{date}</h6>
                            <div className="timeline-entries">
                                {entries.map(entry => (
                                    <div key={entry.id} className="timeline-entry">
                                        <div className="timeline-indicator">
                                            <span className="status-icon">
                                                {entry.completed ? '✅' : '📖'}
                                            </span>
                                        </div>
                                        <div className="timeline-content">
                                            <h6 className="entry-title">
                                                <a href={`/blog/${entry.postSlug}`}>
                                                    {entry.postTitle}
                                                </a>
                                            </h6>
                                            <div className="entry-meta">
                                                <span className="entry-progress">
                                                    {entry.completed ? 'Selesai' : `${Math.round(entry.progress)}%`}
                                                </span>
                                                <span className="entry-time">
                                                    {new Date(entry.readAt).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                {entry.timeSpent > 0 && (
                                                    <span className="entry-duration">
                                                        ⏱️ {entry.timeSpent} menit
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ReadingHistorySection
