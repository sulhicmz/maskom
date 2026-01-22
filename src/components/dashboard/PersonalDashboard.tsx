"use client"

import React, { useState, useEffect, useCallback, memo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuthService } from '@/hooks/useAuthService'
import { useRouter } from 'next/navigation'
import ContinueReadingSection from './ContinueReadingSection'
import ReadingHistorySection from './ReadingHistorySection'
import BookmarksSection from './BookmarksSection'
import EngagementStatisticsSection from './EngagementStatisticsSection'
import ActivityFeedSection from './ActivityFeedSection'
import AccountSettingsSection from './AccountSettingsSection'
import PrivacySettingsSection from './PrivacySettingsSection'
import AccessibilitySettingsSection from './AccessibilitySettingsSection'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { UserDashboardData } from '@/types/dashboard'
import { loadDashboardData } from '@/utils/dashboardUtils'

const DASHBOARD_SECTIONS = [
    { id: 'overview', label: 'Ikhtisar', icon: '📊' },
    { id: 'history', label: 'Riwayat Bacaan', icon: '📚' },
    { id: 'bookmarks', label: 'Bookmark', icon: '🔖' },
    { id: 'statistics', label: 'Statistik', icon: '📈' },
    { id: 'activity', label: 'Aktivitas', icon: '🔔' },
    { id: 'account', label: 'Akun', icon: '👤' },
    { id: 'privacy', label: 'Privasi', icon: '🔒' },
    { id: 'accessibility', label: 'Aksesibilitas', icon: '♿' },
] as const

type DashboardSectionId = typeof DASHBOARD_SECTIONS[number]['id']

const PersonalDashboard: React.FC = () => {
    const { theme } = useTheme()
    const { user } = useAuthService()
    const router = useRouter()
    const [isClient, setIsClient] = useState(false)
    const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null)
    const [activeSection, setActiveSection] = useState<DashboardSectionId>('overview')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setIsClient(true)

        if (!user) {
            router.push('/login')
        }
    }, [user, router])

    useEffect(() => {
        const loadData = () => {
            try {
                const data = loadDashboardData()
                setDashboardData(data)
            } catch (error) {
                console.error('Failed to load dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const handleSectionChange = useCallback((sectionId: DashboardSectionId) => {
        setActiveSection(sectionId)
    }, [])

    if (!isClient) {
        return <LoadingSpinner minHeight={400} color="primary" />
    }

    if (!user) {
        return null
    }

    if (loading || !dashboardData) {
        return <LoadingSpinner minHeight={400} color="primary" />
    }

    return (
        <section className={`dashboard-section ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="section-title text-center mb-5">
                            <h2>Dashboard Pribadi</h2>
                            <p className="text-muted">Kelola pengalaman bacaan dan preferensi Anda</p>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-3 col-md-4 mb-4">
                        <div className="dashboard-nav card">
                            <div className="card-body">
                                <h5 className="card-title mb-3">Menu</h5>
                                <nav className="nav flex-column">
                                    {DASHBOARD_SECTIONS.map(section => (
                                        <button
                                            key={section.id}
                                            onClick={() => handleSectionChange(section.id)}
                                            className={`nav-link ${activeSection === section.id ? 'active' : ''}`}
                                        >
                                            <span className="nav-icon">{section.icon}</span>
                                            <span className="nav-label">{section.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-9 col-md-8">
                        <div className="dashboard-content">
                            {activeSection === 'overview' && (
                                <>
                                    <ContinueReadingSection />
                                    <EngagementStatisticsSection statistics={dashboardData.engagementStatistics} />
                                </>
                            )}
                            {activeSection === 'history' && (
                                <ReadingHistorySection />
                            )}
                            {activeSection === 'bookmarks' && (
                                <BookmarksSection />
                            )}
                            {activeSection === 'statistics' && (
                                <EngagementStatisticsSection statistics={dashboardData.engagementStatistics} />
                            )}
                            {activeSection === 'activity' && (
                                <ActivityFeedSection />
                            )}
                            {activeSection === 'account' && (
                                <AccountSettingsSection preferences={dashboardData.preferences} />
                            )}
                            {activeSection === 'privacy' && (
                                <PrivacySettingsSection />
                            )}
                            {activeSection === 'accessibility' && (
                                <AccessibilitySettingsSection settings={dashboardData.accessibilitySettings} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

PersonalDashboard.displayName = 'PersonalDashboard'

export default memo(PersonalDashboard)
