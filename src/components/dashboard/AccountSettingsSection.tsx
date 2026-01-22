"use client"

import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { UserPreferences } from '@/types/dashboard'
import { loadDashboardData, saveDashboardData } from '@/utils/dashboardUtils'
import { toast } from 'react-toastify'

interface AccountSettingsSectionProps {
    preferences: UserPreferences
}

const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({ preferences: initialPreferences }) => {
    const { setTheme } = useTheme()
    const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences)
    const [saving, setSaving] = useState(false)

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
        setPreferences(prev => ({
            ...prev,
            theme: newTheme
        }))
        if (newTheme !== 'auto') {
            setTheme(newTheme)
        }
    }

    const handleLanguageChange = (newLanguage: 'en' | 'id') => {
        setPreferences(prev => ({
            ...prev,
            language: newLanguage
        }))
    }

    const handleNotificationChange = (key: keyof UserPreferences['notificationSettings'], value: boolean) => {
        setPreferences(prev => ({
            ...prev,
            notificationSettings: {
                ...prev.notificationSettings,
                [key]: value
            }
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const dashboardData = loadDashboardData()
            if (dashboardData) {
                dashboardData.preferences = preferences
                saveDashboardData(dashboardData)
                toast.success('Pengaturan berhasil disimpan')
            }
        } catch (error) {
            console.error('Failed to save settings:', error)
            toast.error('Gagal menyimpan pengaturan')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="card mb-4">
            <div className="card-header">
                <h5 className="card-title mb-0">
                    <span className="section-icon">⚙️</span>
                    Pengaturan Akun
                </h5>
            </div>
            <div className="card-body">
                <div className="settings-form">
                    <div className="form-section">
                        <h6 className="section-title">Tampilan</h6>
                        <div className="form-group">
                            <label htmlFor="theme-select">Tema</label>
                            <select
                                id="theme-select"
                                className="form-control"
                                value={preferences.theme}
                                onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'auto')}
                            >
                                <option value="light">Terang</option>
                                <option value="dark">Gelap</option>
                                <option value="auto">Otomatis</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="language-select">Bahasa</label>
                            <select
                                id="language-select"
                                className="form-control"
                                value={preferences.language}
                                onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'id')}
                            >
                                <option value="id">Bahasa Indonesia</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <h6 className="section-title">Notifikasi</h6>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="email-notifications"
                                className="form-check-input"
                                checked={preferences.notificationSettings.emailNotifications}
                                onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                            />
                            <label htmlFor="email-notifications" className="form-check-label">
                                Notifikasi Email
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="push-notifications"
                                className="form-check-input"
                                checked={preferences.notificationSettings.pushNotifications}
                                onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                            />
                            <label htmlFor="push-notifications" className="form-check-label">
                                Notifikasi Push
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="new-posts-notifications"
                                className="form-check-input"
                                checked={preferences.notificationSettings.newPostsNotifications}
                                onChange={(e) => handleNotificationChange('newPostsNotifications', e.target.checked)}
                            />
                            <label htmlFor="new-posts-notifications" className="form-check-label">
                                Notifikasi Postingan Baru
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="comment-reply-notifications"
                                className="form-check-input"
                                checked={preferences.notificationSettings.commentReplyNotifications}
                                onChange={(e) => handleNotificationChange('commentReplyNotifications', e.target.checked)}
                            />
                            <label htmlFor="comment-reply-notifications" className="form-check-label">
                                Notifikasi Balasan Komentar
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="weekly-digest"
                                className="form-check-input"
                                checked={preferences.notificationSettings.weeklyDigest}
                                onChange={(e) => handleNotificationChange('weeklyDigest', e.target.checked)}
                            />
                            <label htmlFor="weekly-digest" className="form-check-label">
                                Ringkasan Mingguan
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccountSettingsSection
