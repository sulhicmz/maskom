"use client"

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { ActivityEvent } from '@/types/dashboard'
import { loadDashboardData, getActivityFeed } from '@/utils/dashboardUtils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-toastify'

const ActivityFeedSection: React.FC = () => {
    const { theme } = useTheme()
    const [activities, setActivities] = useState<ActivityEvent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadActivities = () => {
            try {
                const dashboardData = loadDashboardData()
                if (dashboardData) {
                    const feed = getActivityFeed(dashboardData.activityFeed, 20)
                    setActivities(feed)
                }
            } catch (error) {
                console.error('Failed to load activity feed:', error)
                toast.error('Gagal memuat aktivitas')
            } finally {
                setLoading(false)
            }
        }
        loadActivities()
    }, [])

    if (loading) {
        return <LoadingSpinner minHeight={200} color="primary" />
    }

    if (activities.length === 0) {
        return (
            <div className="card mb-4">
                <div className="card-body text-center py-5">
                    <div className="empty-state">
                        <span className="empty-icon">📭</span>
                        <h5>Belum ada aktivitas</h5>
                        <p className="text-muted">Aktivitas Anda akan muncul di sini</p>
                    </div>
                </div>
            </div>
        )
    }

    const getActivityIcon = (type: ActivityEvent['type']) => {
        const icons: Record<ActivityEvent['type'], string> = {
            read: '📖',
            bookmark: '🔖',
            comment: '💬',
            share: '📤',
            like: '❤️'
        }
        return icons[type] || '📝'
    }

    const getActivityLabel = (type: ActivityEvent['type']) => {
        const labels: Record<ActivityEvent['type'], string> = {
            read: 'Membaca',
            bookmark: 'Menandai bookmark',
            comment: 'Mengomentar',
            share: 'Berbagi',
            like: 'Menyukai'
        }
        return labels[type] || 'Aktivitas'
    }

    return (
        <div className="card mb-4">
            <div className="card-header">
                <h5 className="card-title mb-0">
                    <span className="section-icon">📋</span>
                    Feed Aktivitas
                </h5>
            </div>
            <div className="card-body">
                <div className="activity-feed">
                    {activities.map(activity => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-icon-wrapper">
                                <span className="activity-icon">
                                    {getActivityIcon(activity.type)}
                                </span>
                            </div>
                            <div className="activity-content">
                                <p className="activity-text">
                                    <strong>{getActivityLabel(activity.type)}</strong>
                                    {activity.postTitle && (
                                        <>
                                            {' '}postingan "{activity.postTitle}"
                                        </>
                                    )}
                                </p>
                                <span className="activity-time">
                                    {new Date(activity.timestamp).toLocaleString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ActivityFeedSection
