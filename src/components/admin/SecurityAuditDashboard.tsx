'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import securityAuditScanner from '@/utils/securityAudit/scanner';
import type {
  SecurityAudit,
  SecurityVulnerability,
  SecuritySeverity,
  RemediationStatus,
  SecurityPolicy,
  SecurityScore,
  SecurityMetrics,
} from '@/types/securityAudit';

const SecurityAuditDashboard = () => {
  const { theme: _theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'vulnerabilities' | 'compliance' | 'policies' | 'history'>('overview');
  const [isScanning, setIsScanning] = useState(false);
  const [latestAudit, setLatestAudit] = useState<SecurityAudit | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<SecurityVulnerability[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [securityScore, setSecurityScore] = useState<SecurityScore | null>(null);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState<SecurityVulnerability | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTo, setAssignTo] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [auditHistory, setAuditHistory] = useState<SecurityAudit[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<SecuritySeverity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<RemediationStatus | 'all'>('all');

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setAuditHistory(securityAuditScanner.getAuditHistory());
    setVulnerabilities(securityAuditScanner.getVulnerabilities());
    setPolicies(securityAuditScanner.getPolicies());
    setSecurityScore(securityAuditScanner.getSecurityScore());
    setMetrics(securityAuditScanner.getSecurityMetrics());
    
    const history = securityAuditScanner.getAuditHistory();
    if (history.length > 0) {
      setLatestAudit(history[0]);
    }
  };

  const handleRunAudit = async () => {
    setIsScanning(true);
    try {
      const audit = await securityAuditScanner.runAudit();
      setLatestAudit(audit);
      loadData();
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAssignVulnerability = () => {
    if (selectedVulnerability && assignTo) {
      securityAuditScanner.assignVulnerability(selectedVulnerability.id, assignTo);
      setShowAssignModal(false);
      setAssignTo('');
      setSelectedVulnerability(null);
      loadData();
    }
  };

  const handleResolveVulnerability = () => {
    if (selectedVulnerability) {
      securityAuditScanner.resolveVulnerability(selectedVulnerability.id, resolveNotes);
      setShowResolveModal(false);
      setResolveNotes('');
      setSelectedVulnerability(null);
      loadData();
    }
  };

  const handleVerifyFix = (vulnerabilityId: string) => {
    securityAuditScanner.verifyFix(vulnerabilityId);
    loadData();
  };

  const handleUpdatePolicy = (policyId: string, enabled: boolean) => {
    securityAuditScanner.updatePolicy(policyId, { enabled });
    loadData();
  };

  const getSeverityColor = (severity: SecuritySeverity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      case 'moderate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
    }
  };

  const getStatusColor = (status: RemediationStatus) => {
    switch (status) {
      case 'unassigned': return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
      case 'assigned': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'resolved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'verified': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
    }
  };

  const getSeverityLabel = (severity: SecuritySeverity) => {
    switch (severity) {
      case 'critical': return 'Kritis';
      case 'high': return 'Tinggi';
      case 'moderate': return 'Sedang';
      case 'low': return 'Rendah';
    }
  };

  const getStatusLabel = (status: RemediationStatus) => {
    switch (status) {
      case 'unassigned': return 'Belum Ditugaskan';
      case 'assigned': return 'Ditugaskan';
      case 'in_progress': return 'Sedang Dikerjakan';
      case 'resolved': return 'Terselesaikan';
      case 'verified': return 'Terverifikasi';
    }
  };

  const filteredVulnerabilities = vulnerabilities.filter(v => {
    if (filterSeverity !== 'all' && v.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && v.remediationStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Audit Keamanan
          </h1>
          <button
            onClick={handleRunAudit}
            disabled={isScanning}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              isScanning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isScanning ? 'Memindai...' : 'Jalankan Audit'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { key: 'overview', label: 'Ringkasan' },
                { key: 'vulnerabilities', label: 'Kerentanan' },
                { key: 'compliance', label: 'Kepatuhan' },
                { key: 'policies', label: 'Kebijakan' },
                { key: 'history', label: 'Riwayat' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Skor Keamanan
                    </h3>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {securityScore?.overall || 0}/100
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Audit terakhir: {latestAudit?.completedAt 
                        ? new Date(latestAudit.completedAt).toLocaleDateString('id-ID')
                        : 'Belum ada audit'}
                    </p>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Kerentanan Kritis
                    </h3>
                    <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                      {vulnerabilities.filter(v => v.severity === 'critical').length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Perlu perhatian segera
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Kerentanan Terselesaikan
                    </h3>
                    <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                      {latestAudit?.vulnerabilitiesResolved || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Dari {latestAudit?.vulnerabilitiesFound || 0} total
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Rata-rata Perbaikan
                    </h3>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {metrics?.averageTimeToFix[0]?.avgHours.toFixed(1) || 0}h
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Waktu untuk perbaikan kritis
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Tren Kerentanan (30 Hari)
                    </h3>
                    <div className="space-y-3">
                      {metrics?.vulnerabilityTrends.slice(-7).map((trend, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(trend.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                          </span>
                          <div className="flex space-x-2">
                            <span className="text-xs text-red-600 dark:text-red-400">
                              C: {trend.critical}
                            </span>
                            <span className="text-xs text-orange-600 dark:text-orange-400">
                              T: {trend.high}
                            </span>
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">
                              S: {trend.moderate}
                            </span>
                            <span className="text-xs text-green-600 dark:text-green-400">
                              R: {trend.low}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Tingkat Perbaikan
                    </h3>
                    <div className="space-y-3">
                      {metrics?.fixRates.map((rate, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {getSeverityLabel(rate.severity)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-48 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  rate.rate >= 80 ? 'bg-green-600' :
                                  rate.rate >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${rate.rate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {rate.rate}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vulnerabilities' && (
              <div>
                <div className="flex space-x-4 mb-6">
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value as SecuritySeverity | 'all')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">Semua Tingkat Keparahan</option>
                    <option value="critical">Kritis</option>
                    <option value="high">Tinggi</option>
                    <option value="moderate">Sedang</option>
                    <option value="low">Rendah</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as RemediationStatus | 'all')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">Semua Status</option>
                    <option value="unassigned">Belum Ditugaskan</option>
                    <option value="assigned">Ditugaskan</option>
                    <option value="in_progress">Sedang Dikerjakan</option>
                    <option value="resolved">Terselesaikan</option>
                    <option value="verified">Terverifikasi</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tingkat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Judul
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Komponen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Ditugaskan Kepada
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredVulnerabilities.map((vuln) => (
                        <tr key={vuln.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {vuln.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                              {getSeverityLabel(vuln.severity)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {vuln.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {vuln.affectedComponent}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vuln.remediationStatus)}`}>
                              {getStatusLabel(vuln.remediationStatus)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {vuln.assignedTo || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {vuln.remediationStatus === 'unassigned' && (
                              <button
                                onClick={() => {
                                  setSelectedVulnerability(vuln);
                                  setShowAssignModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                              >
                                Tugaskan
                              </button>
                            )}
                            {(vuln.remediationStatus === 'assigned' || vuln.remediationStatus === 'in_progress') && (
                              <button
                                onClick={() => {
                                  setSelectedVulnerability(vuln);
                                  setShowResolveModal(true);
                                }}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-3"
                              >
                                Selesaikan
                              </button>
                            )}
                            {vuln.remediationStatus === 'resolved' && (
                              <button
                                onClick={() => handleVerifyFix(vuln.id)}
                                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                              >
                                Verifikasi
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Status Kepatuhan Keamanan
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Tingkat Kepatuhan
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {securityScore?.complianceRate || 100}% audit lulus
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {securityScore?.complianceRate || 100}%
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        OWASP Top 10
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Injeksi</span>
                          <span className="text-green-600 dark:text-green-400">Lulus</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Autentikasi</span>
                          <span className="text-green-600 dark:text-green-400">Lulus</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Manipulasi Data</span>
                          <span className="text-yellow-600 dark:text-yellow-400">Peringatan</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        GDPR
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Perlindungan Data</span>
                          <span className="text-green-600 dark:text-green-400">Lulus</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Hak Pengguna</span>
                          <span className="text-green-600 dark:text-green-400">Lulus</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Security Headers
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">CSP & HSTS</span>
                          <span className="text-red-600 dark:text-red-400">Gagal</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">HTTPS</span>
                          <span className="text-green-600 dark:text-green-400">Lulus</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        RBAC & MFA
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Role-Based Access</span>
                          <span className="text-green-600 dark:text-green-400">Lulus</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Multi-Factor Auth</span>
                          <span className="text-green-600 dark:text-green-400">Lulus</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'policies' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Kebijakan Keamanan
                </h3>
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <div key={policy.id} className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {policy.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {policy.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={policy.enabled}
                            onChange={(e) => handleUpdatePolicy(policy.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium mb-2">Konfigurasi:</p>
                        <pre className="bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto">
                          {JSON.stringify(policy.config, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Riwayat Audit
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tanggal Mulai
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Kerentanan Ditemukan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Kerentanan Terselesaikan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Skor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Waktu Perbaikan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {auditHistory.map((audit) => (
                        <tr key={audit.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {audit.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(audit.startedAt).toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              audit.status === 'completed'
                                ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
                                : 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {audit.status === 'completed' ? 'Selesai' : 'Gagal'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {audit.totalVulnerabilities}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {audit.resolvedVulnerabilities}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`font-medium ${
                              audit.score >= 80 ? 'text-green-600 dark:text-green-400' :
                              audit.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {audit.score}/100
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {audit.timeToFix ? `${audit.timeToFix.toFixed(1)} jam` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tugaskan Kerentanan
              </h3>
              <input
                type="text"
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                placeholder="Nama atau email penerima tugas"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setAssignTo('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={handleAssignVulnerability}
                  disabled={!assignTo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Tugaskan
                </button>
              </div>
            </div>
          </div>
        )}

        {showResolveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Selesaikan Kerentanan
              </h3>
              <textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Catatan tentang bagaimana masalah diselesaikan"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResolveModal(false);
                    setResolveNotes('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={handleResolveVulnerability}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Selesaikan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityAuditDashboard;
