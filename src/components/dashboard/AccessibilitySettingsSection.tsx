"use client"

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { AccessibilitySettings } from '@/types/dashboard'
import { loadDashboardData, saveDashboardData } from '@/utils/dashboardUtils'
import { toast } from 'react-toastify'

interface AccessibilitySettingsSectionProps {
    settings: AccessibilitySettings
}

const AccessibilitySettingsSection: React.FC<AccessibilitySettingsSectionProps> = ({ settings: initialSettings }) => {
    const { theme } = useTheme()
    const [settings, setSettings] = useState<AccessibilitySettings>(initialSettings)
    const [saving, setSaving] = useState(false)

    const handleFontSizeChange = (fontSize: AccessibilitySettings['fontSize']) => {
        setSettings(prev => ({
            ...prev,
            fontSize
        }))
    }

    const handleSettingChange = (key: keyof AccessibilitySettings, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
        const root = document.documentElement
        
        root.style.fontSize = `${newSettings.fontSize}%`
        
        if (newSettings.highContrastMode) {
            root.setAttribute('data-high-contrast', 'true')
        } else {
            root.removeAttribute('data-high-contrast')
        }
        
        if (newSettings.reducedMotion) {
            root.setAttribute('data-reduced-motion', 'true')
        } else {
            root.removeAttribute('data-reduced-motion')
        }
        
        if (newSettings.screenReaderOptimized) {
            root.setAttribute('data-screen-reader', 'true')
        } else {
            root.removeAttribute('data-screen-reader')
        }
    }

    useEffect(() => {
        applyAccessibilitySettings(settings)
    }, [settings])

    const handleSave = async () => {
        setSaving(true)
        try {
            const dashboardData = loadDashboardData()
            if (dashboardData) {
                dashboardData.accessibilitySettings = settings
                saveDashboardData(dashboardData)
                toast.success('Pengaturan aksesibilitas berhasil disimpan')
            }
        } catch (error) {
            console.error('Failed to save accessibility settings:', error)
            toast.error('Gagal menyimpan pengaturan')
        } finally {
            setSaving(false)
        }
    }

    const fontSizeOptions = [
        { value: 100, label: 'Normal (100%)' },
        { value: 110, label: 'Sedang (110%)' },
        { value: 125, label: 'Besar (125%)' },
        { value: 150, label: 'Sangat Besar (150%)' }
    ]

    return (
        <div className="card mb-4">
            <div className="card-header">
                <h5 className="card-title mb-0">
                    <span className="section-icon">♿</span>
                    Pengaturan Aksesibilitas
                </h5>
            </div>
            <div className="card-body">
                <div className="accessibility-settings">
                    <div className="setting-group">
                        <h6 className="group-title">Ukuran Font</h6>
                        <div className="font-size-options">
                            {fontSizeOptions.map(option => (
                                <button
                                    key={option.value}
                                    className={`btn ${settings.fontSize === option.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => handleFontSizeChange(option.value as AccessibilitySettings['fontSize'])}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="setting-group">
                        <h6 className="group-title">Mode Kontras Tinggi</h6>
                        <div className="toggle-wrapper">
                            <div className="toggle-switch">
                                <input
                                    type="checkbox"
                                    id="high-contrast"
                                    checked={settings.highContrastMode}
                                    onChange={(e) => handleSettingChange('highContrastMode', e.target.checked)}
                                    aria-label="Mode kontras tinggi"
                                />
                                <label htmlFor="high-contrast" className="toggle-label">
                                    <span className="toggle-slider"></span>
                                    <span className="toggle-text">
                                        {settings.highContrastMode ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </label>
                            </div>
                            <p className="setting-description">
                                Meningkatkan kontras warna untuk keterbacaan yang lebih baik
                            </p>
                        </div>
                    </div>

                    <div className="setting-group">
                        <h6 className="group-title">Gerak Dikurangi</h6>
                        <div className="toggle-wrapper">
                            <div className="toggle-switch">
                                <input
                                    type="checkbox"
                                    id="reduced-motion"
                                    checked={settings.reducedMotion}
                                    onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                                    aria-label="Gerak dikurangi"
                                />
                                <label htmlFor="reduced-motion" className="toggle-label">
                                    <span className="toggle-slider"></span>
                                    <span className="toggle-text">
                                        {settings.reducedMotion ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </label>
                            </div>
                            <p className="setting-description">
                                Mengurangi atau menghilangkan animasi untuk pengalaman yang lebih nyaman
                            </p>
                        </div>
                    </div>

                    <div className="setting-group">
                        <h6 className="group-title">Optimasi Pembaca Layar</h6>
                        <div className="toggle-wrapper">
                            <div className="toggle-switch">
                                <input
                                    type="checkbox"
                                    id="screen-reader"
                                    checked={settings.screenReaderOptimized}
                                    onChange={(e) => handleSettingChange('screenReaderOptimized', e.target.checked)}
                                    aria-label="Optimasi pembaca layar"
                                />
                                <label htmlFor="screen-reader" className="toggle-label">
                                    <span className="toggle-slider"></span>
                                    <span className="toggle-text">
                                        {settings.screenReaderOptimized ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </label>
                            </div>
                            <p className="setting-description">
                                Mengoptimalkan elemen antarmuka untuk pembaca layar
                            </p>
                        </div>
                    </div>
                </div>

                <div className="form-actions mt-4">
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
    )
}

export default AccessibilitySettingsSection
