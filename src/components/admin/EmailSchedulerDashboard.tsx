"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';
import emailScheduler from '@/utils/emailScheduler';
import type {
    SendTimeInsights,
    OptimalSendWindow,
    ScheduleRecommendation,
    HourlyEngagementData,
    DayOfWeek,
} from '@/types/emailScheduler';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const EmailSchedulerDashboard: React.FC = () => {
    const { theme } = useTheme();
    const [insights, setInsights] = useState<SendTimeInsights | null>(null);
    const [recommendation, setRecommendation] = useState<ScheduleRecommendation | null>(null);
    const [loading, setLoading] = useState(true);
    const [recipientId, setRecipientId] = useState<string>('');

    const DAYS_IN_INDONESIAN: Record<DayOfWeek, string> = {
        Monday: 'Senin',
        Tuesday: 'Selasa',
        Wednesday: 'Rabu',
        Thursday: 'Kamis',
        Friday: 'Jumat',
        Saturday: 'Sabtu',
        Sunday: 'Minggu',
    };

    const getConfidenceBadgeClass = (score: number): string => {
        if (score >= 80) return 'bg-success';
        if (score >= 60) return 'bg-info';
        if (score >= 40) return 'bg-warning';
        return 'bg-secondary';
    };

    const getConfidenceLabel = (score: number): string => {
        if (score >= 80) return 'Tinggi';
        if (score >= 60) return 'Sedang';
        if (score >= 40) return 'Rendah';
        return 'Sangat Rendah';
    };

    const formatTime = (hour: number): string => {
        const h = hour.toString().padStart(2, '0');
        return `${h}:00`;
    };

    const formatDateTime = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateHourlyAverages = (data: HourlyEngagementData[]): { [key: number]: number } => {
        const averages: { [key: number]: number } = {};

        for (let hour = 0; hour < 24; hour++) {
            let totalOpenRate = 0;
            let count = 0;

            data.forEach((hourly) => {
                if (hourly.totalEvents > 0) {
                    totalOpenRate += hourly.openRate;
                    count++;
                }
            });

            averages[hour] = count > 0 ? totalOpenRate / count : 0;
        }

        return averages;
    };

    const getHeatmapColor = (value: number, max: number): string => {
        const percentage = value / max;
        if (percentage === 0) return '#e9ecef';

        if (theme === 'dark') {
            if (percentage > 0.75) return '#198754';
            if (percentage > 0.5) return '#0f5132';
            if (percentage > 0.25) return '#052e16';
            return '#0a3320';
        } else {
            if (percentage > 0.75) return '#d4edda';
            if (percentage > 0.5) return '#c3e6cb';
            if (percentage > 0.25) return '#b8daff';
            return '#a2d2ef';
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            const newInsights = emailScheduler.getSendTimeInsights(recipientId || undefined);
            setInsights(newInsights);

            if (recipientId) {
                const newRecommendation = emailScheduler.calculateOptimalSendTime(recipientId);
                setRecommendation(newRecommendation);
            }

            setLoading(false);
        }, 500);
    };

    const handleClearData = () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua data engagement?')) {
            emailScheduler.clearEngagementData();
            handleRefresh();
        }
    };

    useEffect(() => {
        handleRefresh();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    const maxOpenRate = Math.max(...(insights?.dayOfWeekData.flatMap((d) => d.hourlyData.map((h) => h.openRate)) || [0]), 1);

    return (
        <ProtectedRoute permission={Permission.MANAGE_CAMPAIGNS}>
            <div className={`container mt-4 ${theme === 'dark' ? 'dark-mode' : ''}`}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Intelligent Email Scheduler</h2>
                    <div>
                        <button className="btn btn-outline-primary me-2" onClick={handleRefresh}>
                            Segarkan
                        </button>
                        <button className="btn btn-outline-danger" onClick={handleClearData}>
                            Hapus Data
                        </button>
                    </div>
                </div>

                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">Rekomendasi Waktu Pengiriman</h5>
                    </div>
                    <div className="card-body">
                        {recommendation ? (
                            <div>
                                <div className="alert alert-info">
                                    <strong>Waktu Terbaik:</strong>{' '}
                                    {formatDateTime(recommendation.recommendedSendTime)}
                                    <br />
                                    <small>Timezone: {recommendation.timezone}</small>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-3">
                                        <div className="text-center p-3 border rounded">
                                            <h6>Confidence</h6>
                                            <h4>
                                                <span className={`badge ${getConfidenceBadgeClass(recommendation.confidenceScore)}`}>
                                                    {recommendation.confidenceScore.toFixed(0)}% - {getConfidenceLabel(recommendation.confidenceScore)}
                                                </span>
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-center p-3 border rounded">
                                            <h6>Open Rate Diharapkan</h6>
                                            <h4>{recommendation.expectedOpenRate.toFixed(1)}%</h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-center p-3 border rounded">
                                            <h6>Click Rate Diharapkan</h6>
                                            <h4>{recommendation.expectedClickRate.toFixed(1)}%</h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-center p-3 border rounded">
                                            <h6>Alasan</h6>
                                            <p className="mb-0">{recommendation.reason}</p>
                                        </div>
                                    </div>
                                </div>

                                {recommendation.alternativeOptions.length > 0 && (
                                    <div>
                                        <h6 className="mb-3">Opsi Alternatif</h6>
                                        <div className="table-responsive">
                                            <table className={`table ${theme === 'dark' ? 'table-dark' : ''}`}>
                                                <thead>
                                                    <tr>
                                                        <th>Waktu</th>
                                                        <th>Confidence</th>
                                                        <th>Open Rate</th>
                                                        <th>Click Rate</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recommendation.alternativeOptions.map((option, index) => (
                                                        <tr key={index}>
                                                            <td>{formatDateTime(option.sendTime)}</td>
                                                            <td>
                                                                <span className={`badge ${getConfidenceBadgeClass(option.confidenceScore)}`}>
                                                                    {option.confidenceScore.toFixed(0)}%
                                                                </span>
                                                            </td>
                                                            <td>{option.expectedOpenRate.toFixed(1)}%</td>
                                                            <td>{option.expectedClickRate.toFixed(1)}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-muted py-4">
                                <p>Masukkan ID penerima untuk mendapatkan rekomendasi personal</p>
                                <input
                                    type="text"
                                    className="form-control d-inline-block me-2"
                                    style={{ maxWidth: '300px' }}
                                    placeholder="ID Penerima (contoh: recipient-1)"
                                    value={recipientId}
                                    onChange={(e) => setRecipientId(e.target.value)}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        const rec = emailScheduler.calculateOptimalSendTime(recipientId || undefined);
                                        setRecommendation(rec);
                                    }}
                                >
                                    Dapatkan Rekomendasi
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">Heatmap Engagement</h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className={`table table-sm ${theme === 'dark' ? 'table-dark' : ''}`}>
                                <thead>
                                    <tr>
                                        <th>Jam</th>
                                        {insights?.dayOfWeekData.map((day, index) => (
                                            <th key={index} className="text-center">
                                                {DAYS_IN_INDONESIAN[day.dayOfWeek]}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                                        <tr key={hour}>
                                            <td>{formatTime(hour)}</td>
                                            {insights?.dayOfWeekData.map((day, dayIndex) => {
                                                const hourlyData = day.hourlyData[hour];
                                                const backgroundColor = getHeatmapColor(hourlyData.openRate, maxOpenRate);
                                                return (
                                                    <td
                                                        key={dayIndex}
                                                        className="text-center"
                                                        style={{ backgroundColor }}
                                                    >
                                                        <small>
                                                            {hourlyData.totalEvents > 0 ? (
                                                                <div>
                                                                    <strong>{hourlyData.openRate.toFixed(0)}%</strong>
                                                                    <div className="text-muted" style={{ fontSize: '10px' }}>
                                                                        {hourlyData.totalEvents} events
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </small>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3">
                            <small className="text-muted">
                                <strong>Legenda:</strong> Semakin gelap warna, semakin tinggi tingkat engagement.
                                Jam ditampilkan dari 08:00 hingga 19:00.
                            </small>
                        </div>
                    </div>
                </div>

                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">Jendela Waktu Optimal</h5>
                    </div>
                    <div className="card-body">
                        {insights?.optimalWindows.length === 0 ? (
                            <div className="text-center text-muted py-4">
                                <p>Belum ada data engagement yang cukup untuk menghitung jendela waktu optimal.</p>
                                <p>Cat: Minimal 10-20 event diperlukan untuk menghasilkan rekomendasi yang andal.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className={`table ${theme === 'dark' ? 'table-dark' : ''}`}>
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Hari</th>
                                            <th>Jam</th>
                                            <th>Open Rate</th>
                                            <th>Click Rate</th>
                                            <th>Confidence</th>
                                            <th>Sample Size</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {insights.optimalWindows.slice(0, 10).map((window, index) => (
                                            <tr key={index}>
                                                <td>#{index + 1}</td>
                                                <td>{DAYS_IN_INDONESIAN[window.dayOfWeek]}</td>
                                                <td>
                                                    {formatTime(window.startHour)} - {formatTime(window.endHour)}
                                                </td>
                                                <td>{window.openRate.toFixed(1)}%</td>
                                                <td>{window.clickRate.toFixed(1)}%</td>
                                                <td>
                                                    <span className={`badge ${getConfidenceBadgeClass(window.confidenceScore)}`}>
                                                        {window.confidenceScore.toFixed(0)}%
                                                    </span>
                                                </td>
                                                <td>{window.sampleSize}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Ringkasan Data</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="text-center p-3 border rounded">
                                    <h6>Total Events</h6>
                                    <h4>
                                        {insights?.dayOfWeekData.reduce(
                                            (sum, day) => sum + day.totalEvents,
                                            0
                                        )}
                                    </h4>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="text-center p-3 border rounded">
                                    <h6>Total Opens</h6>
                                    <h4>
                                        {insights?.dayOfWeekData.reduce(
                                            (sum, day) => sum + day.totalOpens,
                                            0
                                        )}
                                    </h4>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="text-center p-3 border rounded">
                                    <h6>Total Clicks</h6>
                                    <h4>
                                        {insights?.dayOfWeekData.reduce(
                                            (sum, day) => sum + day.totalClicks,
                                            0
                                        )}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        <div className="alert alert-warning mt-3">
                            <strong>Info Benchmark Industri:</strong>{' '}
                            Jika data engagement tidak mencukupi, sistem akan menggunakan rekomendasi benchmark industri:
                            Selasa, 09:00 - 11:00 (Open rate: ~25%, Click rate: ~4.5%).
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default EmailSchedulerDashboard;
