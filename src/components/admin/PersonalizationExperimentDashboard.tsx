"use client";

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthService } from '@/hooks/useAuthService';
import { useRouter } from 'next/navigation';
import {
  personalizationExperimentAutomation,
  IPersonalizationExperimentAutomation,
} from '@/utils/personalization';
import {
  PersonalizationExperiment,
  ExperimentStatus,
  ExperimentTemplate,
  ExperimentAlert,
} from '@/types/personalization';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { logComponentError } from '@/utils/errorHandler';

const PersonalizationExperimentDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuthService();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [experiments, setExperiments] = useState<PersonalizationExperiment[]>([]);
  const [templates, setTemplates] = useState<ExperimentTemplate[]>([]);
  const [alerts, setAlerts] = useState<ExperimentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'experiments' | 'templates' | 'queue'>('experiments');
  const [selectedExperiment, setSelectedExperiment] = useState<PersonalizationExperiment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!user || (user.role !== 'admin' && user.role !== 'data_analyst' && user.role !== 'marketer')) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    loadExperiments();
    const interval = setInterval(() => {
      loadExperiments();
      loadAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadExperiments = () => {
    try {
      const allExperiments = personalizationExperimentAutomation.getAllExperiments();
      setExperiments(allExperiments);
      const allTemplates = personalizationExperimentAutomation.getAvailableTemplates();
      setTemplates(allTemplates);
      loadAlerts();
    } catch (error) {
      logComponentError({ componentName: 'PersonalizationExperimentDashboard', operation: 'load experiments', error });
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = () => {
    try {
      const allAlerts = personalizationExperimentAutomation.checkAlerts();
      setAlerts(allAlerts);
    } catch (error) {
      logComponentError({ componentName: 'PersonalizationExperimentDashboard', operation: 'load alerts', error });
    }
  };

  const getStatusBadgeColor = (status: ExperimentStatus): string => {
    const colors: Record<ExperimentStatus, string> = {
      draft: 'bg-secondary',
      scheduled: 'bg-info',
      running: 'bg-success',
      paused: 'bg-warning',
      completed: 'bg-primary',
      failed: 'bg-danger',
    };
    return colors[status];
  };

  const getStatusLabel = (status: ExperimentStatus): string => {
    const labels: Record<ExperimentStatus, string> = {
      draft: 'Draf',
      scheduled: 'Terjadwal',
      running: 'Berjalan',
      paused: 'Jeda',
      completed: 'Selesai',
      failed: 'Gagal',
    };
    return labels[status];
  };

  const handleStartExperiment = (experimentId: string) => {
    try {
      personalizationExperimentAutomation.startExperiment(experimentId);
      loadExperiments();
    } catch (error) {
      logComponentError({ componentName: 'PersonalizationExperimentDashboard', operation: 'start experiment', error });
    }
  };

  const handleStopExperiment = (experimentId: string) => {
    try {
      personalizationExperimentAutomation.stopExperiment(experimentId);
      loadExperiments();
    } catch (error) {
      logComponentError({ componentName: 'PersonalizationExperimentDashboard', operation: 'stop experiment', error });
    }
  };

  const handlePauseExperiment = (experimentId: string) => {
    try {
      personalizationExperimentAutomation.pauseExperiment(experimentId);
      loadExperiments();
    } catch (error) {
      logComponentError({ componentName: 'PersonalizationExperimentDashboard', operation: 'pause experiment', error });
    }
  };

  const handleResumeExperiment = (experimentId: string) => {
    try {
      personalizationExperimentAutomation.resumeExperiment(experimentId);
      loadExperiments();
    } catch (error) {
      logComponentError({ componentName: 'PersonalizationExperimentDashboard', operation: 'resume experiment', error });
    }
  };

  const handleDeleteExperiment = (experimentId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus eksperimen ini?')) {
      try {
        personalizationExperimentAutomation.deleteExperiment(experimentId);
        loadExperiments();
      } catch (error) {
        logComponentError({ componentName: 'PersonalizationExperimentDashboard', operation: 'delete experiment', error });
      }
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    try {
      const experiment = personalizationExperimentAutomation.applyTemplate(templateId, {});
      setSelectedExperiment(experiment);
      setShowTemplateModal(false);
    } catch (error: unknown) {
      logComponentError({ componentName: 'PersonalizationExperimentDashboard', operation: 'apply template', error: error as Error });
    }
  };

  const handleDeclareWinner = (experimentId: string) => {
    try {
      personalizationExperimentAutomation.declareWinner(experimentId);
      loadExperiments();
    } catch (error) {
      logComponentError({ componentName: 'PersonalizationExperimentDashboard', operation: 'declare winner', error });
    }
  };

  const handleRollback = (experimentId: string) => {
    try {
      personalizationExperimentAutomation.rollbackExperiment(experimentId);
      loadExperiments();
    } catch (error) {
      logComponentError({ componentName: 'PersonalizationExperimentDashboard', operation: 'rollback experiment', error });
    }
  };

  const handleAcknowledgeAlert = (alertId: string, experimentId: string) => {
    try {
      const experiment = experiments.find(e => e.id === experimentId);
      if (experiment) {
        const alert = experiment.alerts.find(a => a.id === alertId);
        if (alert) {
          alert.acknowledged = true;
          loadAlerts();
        }
      }
    } catch (error) {
      logComponentError({ componentName: 'PersonalizationExperimentDashboard', operation: 'acknowledge alert', error });
    }
  };

  if (!isClient) {
    return <LoadingSpinner />;
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Otomatisasi Eksperimen Personalisasi</h1>
      
      {alerts.length > 0 && (
        <div className="alert alert-warning mb-4">
          <h5 className="alert-heading">Alert Eksperimen</h5>
          <ul className="mb-0">
            {alerts.map(alert => (
              <li key={alert.id} className="mb-2">
                <strong>{alert.type === 'critical' ? 'Kritis' : alert.type === 'warning' ? 'Peringatan' : 'Info'}:</strong> {alert.message}
                <button
                  className="btn btn-sm btn-outline-secondary ms-2"
                  onClick={() => handleAcknowledgeAlert(alert.id, alert.experimentId)}
                >
                  Tandai Dibaca
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'experiments' ? 'active' : ''}`}
            onClick={() => setActiveTab('experiments')}
          >
            Eksperimen ({experiments.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            Template ({templates.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            Antrian
          </button>
        </li>
      </ul>

      {activeTab === 'experiments' && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Eksperimen</h5>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Buat Eksperimen Baru
            </button>
          </div>

          {experiments.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p>Tidak ada eksperimen. Buat eksperimen baru untuk memulai.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className={`table table-striped ${theme === 'dark' ? 'table-dark' : ''}`}>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Status</th>
                    <th>Varian</th>
                    <th>Impresi</th>
                    <th>Konversi</th>
                    <th>Lift</th>
                    <th>Dibuat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {experiments.map(experiment => (
                    <tr key={experiment.id}>
                      <td>{experiment.name}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeColor(experiment.status)}`}>
                          {getStatusLabel(experiment.status)}
                        </span>
                      </td>
                      <td>{experiment.variants.length}</td>
                      <td>
                        {experiment.variants.reduce((sum, v) => sum + v.metrics.impressions, 0)}
                      </td>
                      <td>
                        {experiment.variants.reduce((sum, v) => sum + v.metrics.conversions, 0)}
                      </td>
                      <td>
                        {experiment.winner
                          ? `${experiment.winner.lift.toFixed(2)}%`
                          : '-'}
                      </td>
                      <td>{new Date(experiment.createdAt).toLocaleDateString('id-ID')}</td>
                      <td>
                        <div className="btn-group">
                          {experiment.status === 'draft' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleStartExperiment(experiment.id)}
                            >
                              Mulai
                            </button>
                          )}
                          {experiment.status === 'running' && (
                            <>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => handlePauseExperiment(experiment.id)}
                              >
                                Jeda
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleStopExperiment(experiment.id)}
                              >
                                Stop
                              </button>
                            </>
                          )}
                          {experiment.status === 'paused' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleResumeExperiment(experiment.id)}
                            >
                              Lanjut
                            </button>
                          )}
                          {experiment.status === 'running' && (
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => handleDeclareWinner(experiment.id)}
                            >
                              Pilih Pemenang
                            </button>
                          )}
                          {experiment.winner && experiment.status === 'completed' && (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleRollback(experiment.id)}
                            >
                              Rollback
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteExperiment(experiment.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="mb-4">
          <h5 className="mb-3">Template Eksperimen</h5>

          {templates.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p>Tidak ada template yang tersedia.</p>
            </div>
          ) : (
            <div className="row">
              {templates.map(template => (
                <div key={template.id} className="col-md-4 mb-4">
                  <div className={`card ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                    <div className="card-body">
                      <h6 className="card-title">{template.name}</h6>
                      <p className="card-text small">{template.description}</p>
                      <div className="mb-2">
                        <span className="badge bg-primary">{template.category}</span>
                        <span className="badge bg-info ms-1">{template.difficulty}</span>
                      </div>
                      <p className="card-text small text-muted">
                        Durasi: {template.expectedDuration} hari<br />
                        Lift Estimasi: {template.estimatedLift}%
                      </p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApplyTemplate(template.id)}
                      >
                        Terapkan Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="mb-4">
          <h5 className="mb-3">Antrian Eksperimen</h5>
          {personalizationExperimentAutomation.getExperimentQueue().experiments.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p>Tidak ada eksperimen dalam antrian.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className={`table table-striped ${theme === 'dark' ? 'table-dark' : ''}`}>
                <thead>
                  <tr>
                    <th>ID Eksperimen</th>
                    <th>Status Antrian</th>
                  </tr>
                </thead>
                <tbody>
                  {personalizationExperimentAutomation.getExperimentQueue().experiments.map(experimentId => {
                    const experiment = experiments.find(e => e.id === experimentId);
                    return (
                      <tr key={experimentId}>
                        <td>{experimentId}</td>
                        <td>{experiment ? getStatusLabel(experiment.status) : 'Tidak ditemukan'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalizationExperimentDashboard;
