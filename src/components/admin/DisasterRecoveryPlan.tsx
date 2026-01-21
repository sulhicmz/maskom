"use client"

import React, { useState, useEffect, memo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { DisasterRecoveryPlan, ValidationChecklist } from '@/types/backup'
import { DEFAULT_DISASTER_RECOVERY_PLAN } from '@/types/backup'

interface DisasterRecoveryPlanProps {
  plan?: DisasterRecoveryPlan
}

const StepItem = memo(({
  step,
  completedSteps,
  onToggleStep,
}: {
  step: DisasterRecoveryPlan['restoreSteps'][0]
  completedSteps: Set<number>
  onToggleStep: (stepNumber: number) => void
}) => {
  const { theme } = useTheme()
  const isCompleted = completedSteps.has(step.step)
  const canStart = step.dependencies.every((dep) => completedSteps.has(dep))

  return (
    <div
      className={`card mb-3 ${theme === 'dark' ? 'dark-mode' : ''}`}
    >
      <div
        className={`card-body ${isCompleted ? 'bg-success bg-opacity-10' : ''}`}
      >
        <div className="d-flex align-items-start gap-3">
          <div>
            <div
              className={`step-indicator ${
                isCompleted
                  ? 'completed'
                  : canStart
                    ? 'pending'
                    : 'disabled'
              }`}
            >
              {isCompleted ? (
                <i className="bi bi-check-lg"></i>
              ) : (
                <span>{step.step}</span>
              )}
            </div>
          </div>

          <div className="flex-grow-1">
            <h6 className="mb-2">
              {step.title}
              {isCompleted && (
                <span className="badge bg-success ms-2">Selesai</span>
              )}
            </h6>
            <p className="mb-2 text-muted">{step.description}</p>
            <div className="mb-2">
              <small className="text-muted">
                <i className="bi bi-clock me-1"></i>
                Estimasi Waktu: {step.estimatedTime}
              </small>
            </div>

            {!isCompleted && canStart && (
              <button
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={() => onToggleStep(step.step)}
              >
                Mulai Langkah {step.step}
              </button>
            )}

            {!canStart && (
              <small className="text-muted d-block mt-2">
                <i className="bi bi-info-circle me-1"></i>
                Menunggu langkah sebelumnya selesai
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

StepItem.displayName = 'StepItem'

const DisasterRecoveryPlanComponent: React.FC<DisasterRecoveryPlanProps> = ({
  plan,
}) => {
  const { theme } = useTheme()
  const [currentPlan, setCurrentPlan] = useState<DisasterRecoveryPlan>(
    plan || DEFAULT_DISASTER_RECOVERY_PLAN,
  )
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [validationChecklist, setValidationChecklist] =
    useState<ValidationChecklist>(
      currentPlan.validationChecklist,
    )

  useEffect(() => {
    if (plan) {
      setCurrentPlan(plan)
      setValidationChecklist(plan.validationChecklist)
    }
  }, [plan])

  const handleToggleStep = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber)
    } else {
      newCompleted.add(stepNumber)
    }
    setCompletedSteps(newCompleted)
  }

  const handleToggleValidation = (key: keyof ValidationChecklist) => {
    setValidationChecklist({
      ...validationChecklist,
      [key]: !validationChecklist[key],
    })
  }

  const handleResetChecklist = () => {
    setCompletedSteps(new Set())
    setValidationChecklist({
      dataIntegrity: false,
      backupVerification: false,
      rollbackPlan: false,
      notificationSent: false,
      documented: false,
    })
  }

  const allValidationsComplete = Object.values(validationChecklist).every(
    (value) => value === true,
  )

  const allStepsCompleted =
    completedSteps.size === currentPlan.restoreSteps.length

  return (
    <section className={`disaster-recovery-section ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-title text-center mb-5">
              <h2>Rencana Pemulihan Bencana</h2>
              <p className="text-muted">
                Panduan langkah demi langkah untuk memulihkan sistem setelah kegagalan
              </p>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
              <div className="card-body">
                <div className="text-center">
                  <h6 className="text-muted mb-2">Target Waktu Pemulihan (RTO)</h6>
                  <h4 className="mb-0">{currentPlan.rto}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
              <div className="card-body">
                <div className="text-center">
                  <h6 className="text-muted mb-2">
                    Target Kehilangan Data (RPO)
                  </h6>
                  <h4 className="mb-0">{currentPlan.rpo}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
              <div className="card-body">
                <div className="text-center">
                  <h6 className="text-muted mb-2">Strategi Backup</h6>
                  <p className="mb-0">{currentPlan.backupStrategy}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
              <div className="card-header">
                <h5 className="mb-0">
                  Langkah-Langkah Pemulihan ({currentPlan.restoreSteps.length} langkah)
                </h5>
              </div>
              <div className="card-body">
                <div className="progress mb-3">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${(completedSteps.size / currentPlan.restoreSteps.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <small className="text-muted mb-3 d-block">
                  {completedSteps.size} dari {currentPlan.restoreSteps.length} langkah
                  selesai
                </small>

                {currentPlan.restoreSteps.map((step) => (
                  <StepItem
                    key={step.step}
                    step={step}
                    completedSteps={completedSteps}
                    onToggleStep={handleToggleStep}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-clipboard-check me-2"></i>
                  Daftar Periksa Validasi
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="dataIntegrity"
                        checked={validationChecklist.dataIntegrity}
                        onChange={() =>
                          handleToggleValidation('dataIntegrity')
                        }
                      />
                      <label className="form-check-label" htmlFor="dataIntegrity">
                        Integritas data terverifikasi
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="backupVerification"
                        checked={validationChecklist.backupVerification}
                        onChange={() =>
                          handleToggleValidation('backupVerification')
                        }
                      />
                      <label className="form-check-label" htmlFor="backupVerification">
                        Backup terverifikasi
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rollbackPlan"
                        checked={validationChecklist.rollbackPlan}
                        onChange={() =>
                          handleToggleValidation('rollbackPlan')
                        }
                      />
                      <label className="form-check-label" htmlFor="rollbackPlan">
                        Rencana rollback tersedia
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notificationSent"
                        checked={validationChecklist.notificationSent}
                        onChange={() =>
                          handleToggleValidation('notificationSent')
                        }
                      />
                      <label className="form-check-label" htmlFor="notificationSent">
                        Notifikasi dikirim ke stakeholder
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="documented"
                        checked={validationChecklist.documented}
                        onChange={() =>
                          handleToggleValidation('documented')
                        }
                      />
                      <label className="form-check-label" htmlFor="documented">
                        Proses didokumentasikan
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h6>
                    Status Validasi:{' '}
                    {allValidationsComplete ? (
                      <span className="badge bg-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Lengkap
                      </span>
                    ) : (
                      <span className="badge bg-warning">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Belum Lengkap
                      </span>
                    )}
                  </h6>
                  <p className="text-muted">
                    {Object.values(validationChecklist).filter((v) => v).length} / 5
                    item terverifikasi
                  </p>
                </div>

                {allStepsCompleted && allValidationsComplete && (
                  <button
                    className="btn btn-success mt-3"
                    onClick={handleResetChecklist}
                  >
                    <i className="bi bi-arrow-counterclockwise me-2"></i>
                    Reset Daftar Periksa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-telephone me-2"></i>
                  Kontak Darurat
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>Peran</th>
                        <th>Email</th>
                        <th>Telepon</th>
                        <th>Prioritas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPlan.contactInfo.map((contact, index) => (
                        <tr key={index}>
                          <td>{contact.name}</td>
                          <td>{contact.role}</td>
                          <td>
                            <a href={`mailto:${contact.email}`}>{contact.email}</a>
                          </td>
                          <td>
                            <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                contact.priority === 1
                                  ? 'bg-danger'
                                  : contact.priority === 2
                                    ? 'bg-warning'
                                    : 'bg-secondary'
                              }`}
                            >
                              {contact.priority === 1 ? 'Utama' : contact.priority === 2 ? 'Kedua' : 'Cadangan'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

DisasterRecoveryPlanComponent.displayName = "DisasterRecoveryPlanComponent"

export default memo(DisasterRecoveryPlanComponent)
