"use client"

import React, { useState, useEffect, memo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuthService } from '@/hooks/useAuthService'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
    getSuspiciousAlerts,
    resolveAlert,
    getAlertRules,
    saveAlertRule,
    updateAlertRule,
    deleteAlertRule,
} from '@/utils/activityLogger'
import { SuspiciousActivityAlert, AlertRule, ActivityAction } from '@/types/audit'
import { Permission } from '@/types/permission'

const AlertRow = memo(({ alert, onResolve }: { alert: SuspiciousActivityAlert; onResolve: (alertId: string) => void }) => {
    const { theme } = useTheme()
    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp)
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
    }

    const getSeverityColor = (count: number, threshold: number): string => {
        const ratio = count / threshold
        if (ratio >= 3) return 'danger'
        if (ratio >= 2) return 'warning'
        return 'info'
    }

    const severity = getSeverityColor(alert.count, alert.threshold)

    return (
        <tr className={theme === 'dark' ? 'table-dark' : ''}>
            <td><small>{alert.id}</small></td>
            <td>
                <span className={`badge bg-${severity}`}>
                    {alert.ruleName}
                </span>
            </td>
            <td>{alert.userId || 'N/A'}</td>
            <td>
                <span className="badge bg-secondary">{alert.action}</span>
            </td>
            <td>
                <strong className={severity === 'danger' ? 'text-danger' : ''}>{alert.count}</strong>
                / {alert.threshold}
            </td>
            <td>{formatTimestamp(alert.triggeredAt)}</td>
            <td>
                {alert.resolved ? (
                    <span className="badge bg-success">
                        Terselesaikan: {alert.resolvedAt ? formatTimestamp(alert.resolvedAt) : 'N/A'}
                    </span>
                ) : (
                    <span className="badge bg-warning">
                        Belum Terselesaikan
                    </span>
                )}
            </td>
            <td>
                {!alert.resolved && (
                    <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => onResolve(alert.id)}
                        title="Selesaikan Alert"
                        aria-label={`Selesaikan alert ${alert.id}`}
                    >
                        <i className="bi bi-check-circle" aria-hidden="true"></i>
                    </button>
                )}
            </td>
        </tr>
    )
})

AlertRow.displayName = 'AlertRow'

const AlertRuleRow = memo(({ rule, onEdit, onDelete }: { rule: AlertRule; onEdit: (rule: AlertRule) => void; onDelete: (ruleId: string) => void }) => {
    const { theme } = useTheme()
    return (
        <tr className={theme === 'dark' ? 'table-dark' : ''}>
            <td><small>{rule.id}</small></td>
            <td>{rule.name}</td>
            <td>
                <span className="badge bg-secondary">{rule.action}</span>
            </td>
            <td>{rule.threshold}</td>
            <td>{rule.timeWindow} menit</td>
            <td>
                {rule.enabled ? (
                    <span className="badge bg-success">Aktif</span>
                ) : (
                    <span className="badge bg-secondary">Nonaktif</span>
                )}
            </td>
            <td>{rule.alertEmail || '-'}</td>
            <td>
                <div className="d-flex gap-2" role="group" aria-label="Alert rule actions">
                    <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => onEdit(rule)}
                        title="Edit Rule"
                        aria-label={`Edit rule ${rule.name}`}
                    >
                        <i className="bi bi-pencil" aria-hidden="true"></i>
                    </button>
                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(rule.id)}
                        title="Hapus Rule"
                        aria-label={`Hapus rule ${rule.name}`}
                    >
                        <i className="bi bi-trash" aria-hidden="true"></i>
                    </button>
                </div>
            </td>
        </tr>
    )
})

AlertRuleRow.displayName = 'AlertRuleRow'

const SuspiciousActivityAlertsPanel: React.FC = () => {
    const { theme } = useTheme()
    const { user } = useAuthService()
    const [isClient, setIsClient] = useState(false)
    const [alerts, setAlerts] = useState<SuspiciousActivityAlert[]>([])
    const [rules, setRules] = useState<AlertRule[]>([])
    const [loading, setLoading] = useState(true)
    const [showRuleForm, setShowRuleForm] = useState(false)
    const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
    const [newRule, setNewRule] = useState<Omit<AlertRule, 'id'>>({
        name: '',
        description: '',
        action: ActivityAction.LOGIN,
        threshold: 5,
        timeWindow: 15,
        enabled: true,
        alertEmail: '',
    })

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (isClient) {
            const loadData = () => {
                setLoading(true)
                try {
                    const loadedAlerts = getSuspiciousAlerts()
                    const loadedRules = getAlertRules()
                    setAlerts(loadedAlerts)
                    setRules(loadedRules)
                } catch (error) {
                    console.error('Failed to load alerts:', error)
                } finally {
                    setLoading(false)
                }
            }

            loadData()
        }
    }, [isClient])

    const handleResolveAlert = (alertId: string) => {
        if (!user) return

        if (confirm('Apakah Anda yakin ingin menyelesaikan alert ini?')) {
            const success = resolveAlert(alertId, user.id || 'user-001')
            if (success) {
                const updatedAlerts = alerts.map(alert =>
                    alert.id === alertId
                        ? { ...alert, resolved: true, resolvedAt: new Date().toISOString(), resolvedBy: user.id }
                        : alert
                )
                setAlerts(updatedAlerts)
            }
        }
    }

    const handleSaveRule = () => {
        if (editingRule) {
            const updatedRule = updateAlertRule(editingRule.id, newRule)
            if (updatedRule) {
                const updatedRules = rules.map(rule =>
                    rule.id === editingRule.id ? updatedRule : rule
                )
                setRules(updatedRules)
                setShowRuleForm(false)
                setEditingRule(null)
            }
        } else {
            const savedRule = saveAlertRule(newRule)
            setRules([...rules, savedRule])
            setShowRuleForm(false)
        }

        setNewRule({
            name: '',
            description: '',
            action: ActivityAction.LOGIN,
            threshold: 5,
            timeWindow: 15,
            enabled: true,
            alertEmail: '',
        })
    }

    const handleEditRule = (rule: AlertRule) => {
        setEditingRule(rule)
        setNewRule(rule)
        setShowRuleForm(true)
    }

    const handleDeleteRule = (ruleId: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus rule ini?')) {
            const success = deleteAlertRule(ruleId)
            if (success) {
                setRules(rules.filter(rule => rule.id !== ruleId))
            }
        }
    }

    const handleCancelRule = () => {
        setShowRuleForm(false)
        setEditingRule(null)
        setNewRule({
            name: '',
            description: '',
            action: ActivityAction.LOGIN,
            threshold: 5,
            timeWindow: 15,
            enabled: true,
            alertEmail: '',
        })
    }

    if (!isClient) {
        return <LoadingSpinner minHeight={400} color="primary" />
    }

    return (
        <ProtectedRoute requiredPermission={Permission.MANAGE_SETTINGS}>
            <section className={`suspicious-alerts-section ${theme === 'dark' ? 'dark-mode' : ''}`}>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="section-title text-center mb-5">
                                <h2>Alert Aktivitas Mencurigakan</h2>
                                <p className="text-muted">Pantau dan kelola aturan untuk deteksi aktivitas mencurigakan</p>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow-sm mb-4">
                                <div className="card-header bg-white">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">
                                            Alert Aktif ({alerts.filter(a => !a.resolved).length})
                                        </h5>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => setShowRuleForm(true)}
                                        >
                                            <i className="bi bi-plus-circle me-1"></i>
                                            Buat Rule Baru
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {loading ? (
                                        <LoadingSpinner minHeight={200} color="primary" />
                                    ) : alerts.length === 0 ? (
                                        <div className="text-center py-5">
                                            <i className="bi bi-shield-check fs-1 text-muted mb-3"></i>
                                            <p className="text-muted">Tidak ada alert yang ditemukan</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">ID</th>
                                                        <th scope="col">Rule</th>
                                                        <th scope="col">Pengguna</th>
                                                        <th scope="col">Aksi</th>
                                                        <th scope="col">Jumlah</th>
                                                        <th scope="col">Waktu</th>
                                                        <th scope="col">Status</th>
                                                        <th scope="col">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {alerts.map(alert => (
                                                        <AlertRow
                                                            key={alert.id}
                                                            alert={alert}
                                                            onResolve={handleResolveAlert}
                                                        />
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">Aturan Alert ({rules.length})</h5>
                                </div>
                                <div className="card-body">
                                    {showRuleForm ? (
                                        <div className="mb-4 p-3 border rounded">
                                            <h6 className="mb-3">
                                                {editingRule ? 'Edit Aturan Alert' : 'Buat Aturan Alert Baru'}
                                            </h6>
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Nama Aturan</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={newRule.name}
                                                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                                        placeholder="Contoh: Multiple Failed Logins"
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Aksi</label>
                                                    <select
                                                        className="form-select"
                                                        value={newRule.action}
                                                        onChange={(e) => setNewRule({ ...newRule, action: e.target.value as ActivityAction })}
                                                    >
                                                        {Object.values(ActivityAction).map(action => (
                                                            <option key={action} value={action}>{action}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Batas Ambang</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={newRule.threshold}
                                                        onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value) })}
                                                        min="1"
                                                    />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Jendela Waktu (menit)</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={newRule.timeWindow}
                                                        onChange={(e) => setNewRule({ ...newRule, timeWindow: parseInt(e.target.value) })}
                                                        min="1"
                                                    />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Email Alert</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        value={newRule.alertEmail || ''}
                                                        onChange={(e) => setNewRule({ ...newRule, alertEmail: e.target.value })}
                                                        placeholder="admin@example.com"
                                                    />
                                                </div>
                                                <div className="col-md-12 mb-3">
                                                    <label className="form-label">Deskripsi</label>
                                                    <textarea
                                                        className="form-control"
                                                        value={newRule.description}
                                                        onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                                                        rows={2}
                                                    />
                                                </div>
                                                <div className="col-md-12 mb-3">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="ruleEnabled"
                                                            checked={newRule.enabled}
                                                            onChange={(e) => setNewRule({ ...newRule, enabled: e.target.checked })}
                                                        />
                                                        <label className="form-check-label" htmlFor="ruleEnabled">
                                                            Aktifkan aturan ini
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <button
                                                        className="btn btn-primary me-2"
                                                        onClick={handleSaveRule}
                                                    >
                                                        <i className="bi bi-save me-1"></i>
                                                        Simpan Aturan
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={handleCancelRule}
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {rules.length === 0 ? (
                                        <p className="text-muted text-center py-3">
                                            Belum ada aturan alert yang dibuat
                                        </p>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">ID</th>
                                                        <th scope="col">Nama</th>
                                                        <th scope="col">Aksi</th>
                                                        <th scope="col">Batas Ambang</th>
                                                        <th scope="col">Jendela Waktu</th>
                                                        <th scope="col">Status</th>
                                                        <th scope="col">Email</th>
                                                        <th scope="col">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rules.map(rule => (
                                                        <AlertRuleRow
                                                            key={rule.id}
                                                            rule={rule}
                                                            onEdit={handleEditRule}
                                                            onDelete={handleDeleteRule}
                                                        />
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </ProtectedRoute>
    )
}

SuspiciousActivityAlertsPanel.displayName = "SuspiciousActivityAlertsPanel"

export default memo(SuspiciousActivityAlertsPanel)
