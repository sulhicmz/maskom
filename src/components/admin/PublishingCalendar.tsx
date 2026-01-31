"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';
import publishingPipeline from '@/utils/publishing/pipeline';
import type {
    CalendarEvent,
    PublishingWorkflow,
    PublishingWorkflowStage,
} from '@/types/publishing';

const STAGE_LABELS: Record<PublishingWorkflowStage, string> = {
    draft: 'Draf',
    review: 'Review',
    approved: 'Disetujui',
    scheduled: 'Terjadwal',
    published: 'Diterbitkan',
};

const STAGE_COLORS: Record<PublishingWorkflowStage, string> = {
    draft: 'bg-secondary',
    review: 'bg-warning',
    approved: 'bg-info',
    scheduled: 'bg-primary',
    published: 'bg-success',
};

const STATUS_LABELS: Record<CalendarEvent['status'], string> = {
    'on-time': 'Tepat Waktu',
    'delayed': 'Terlambat',
    'cancelled': 'Dibatalkan',
};

const STATUS_COLORS: Record<CalendarEvent['status'], string> = {
    'on-time': 'text-success',
    'delayed': 'text-danger',
    'cancelled': 'text-muted',
};

const PublishingCalendar: React.FC = () => {
    const { theme } = useTheme();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [workflows, setWorkflows] = useState<PublishingWorkflow[]>([]);
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);
    const [filterStage, setFilterStage] = useState<PublishingWorkflowStage | 'all'>('all');

    const loadData = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            const allWorkflows = publishingPipeline.getWorkflows();
            setWorkflows(allWorkflows);

            const startDate = new Date(selectedDate);
            const endDate = new Date(selectedDate);

            if (viewMode === 'day') {
                endDate.setDate(endDate.getDate() + 1);
            } else if (viewMode === 'week') {
                startDate.setDate(startDate.getDate() - startDate.getDay());
                endDate.setDate(endDate.getDate() + (7 - startDate.getDay()));
            } else {
                startDate.setDate(1);
                endDate.setMonth(endDate.getMonth() + 1);
                endDate.setDate(0);
            }

            const calendarEvents = publishingPipeline.getCalendarEvents(
                startDate.toISOString(),
                endDate.toISOString()
            );

            let filteredEvents = calendarEvents;
            if (filterStage !== 'all') {
                filteredEvents = calendarEvents.filter((e) => e.stage === filterStage);
            }

            setEvents(filteredEvents);
            setLoading(false);
        }, 500);
    }, [selectedDate, viewMode, filterStage]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
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

    const getWeekDays = useMemo(() => {
        const days: Date[] = [];
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }

        return days;
    }, [selectedDate]);

    const getDayEvents = useCallback((date: Date): CalendarEvent[] => {
        const dateStr = date.toDateString();
        return events.filter((event) => {
            if (!event.scheduledAt) return false;
            const eventDate = new Date(event.scheduledAt);
            return eventDate.toDateString() === dateStr;
        });
    }, [events]);

    const handlePrevPeriod = useCallback(() => {
        setSelectedDate((prev) => {
            const newDate = new Date(prev);
            if (viewMode === 'day') {
                newDate.setDate(newDate.getDate() - 1);
            } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() - 7);
            } else {
                newDate.setMonth(newDate.getMonth() - 1);
            }
            return newDate;
        });
    }, [viewMode]);

    const handleNextPeriod = useCallback(() => {
        setSelectedDate((prev) => {
            const newDate = new Date(prev);
            if (viewMode === 'day') {
                newDate.setDate(newDate.getDate() + 1);
            } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() + 7);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    }, [viewMode]);

    const handleToday = useCallback(() => {
        setSelectedDate(new Date());
    }, []);

    const getDaysInMonth = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: Date[] = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(new Date(year, month, -firstDay.getDay() + i + 1));
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        const totalDays = days.length;
        const remaining = (7 - (totalDays % 7)) % 7;

        for (let i = 1; i <= remaining; i++) {
            days.push(new Date(year, month + 1, i));
        }

        return days;
    }, [selectedDate]);

    if (loading) {
        return <div className="container mt-4 text-center">Memuat...</div>;
    }

    return (
        <ProtectedRoute requiredPermission={Permission.MANAGE_CONTENT}>
            <div className={`container mt-4 ${theme === 'dark' ? 'dark-mode' : ''}`}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Kalender Penerbitan</h2>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary" onClick={handleToday}>
                            Hari Ini
                        </button>
                        <button className="btn btn-outline-secondary" onClick={handlePrevPeriod}>
                            &lt;
                        </button>
                        <button className="btn btn-outline-secondary" onClick={handleNextPeriod}>
                            &gt;
                        </button>
                        <div className="btn-group">
                            <button
                                className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setViewMode('day')}
                            >
                                Hari
                            </button>
                            <button
                                className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setViewMode('week')}
                            >
                                Minggu
                            </button>
                            <button
                                className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setViewMode('month')}
                            >
                                Bulan
                            </button>
                        </div>
                        <select
                            className="form-select"
                            value={filterStage}
                            onChange={(e) => setFilterStage(e.target.value as PublishingWorkflowStage | 'all')}
                        >
                            <option value="all">Semua Tahap</option>
                            <option value="draft">Draf</option>
                            <option value="review">Review</option>
                            <option value="approved">Disetujui</option>
                            <option value="scheduled">Terjadwal</option>
                            <option value="published">Diterbitkan</option>
                        </select>
                        <button className="btn btn-outline-primary" onClick={loadData}>
                            Segarkan
                        </button>
                    </div>
                </div>

                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">{formatDate(selectedDate)}</h5>
                    </div>
                    <div className="card-body">
                        {viewMode === 'week' && (
                            <div className="row">
                                {getWeekDays.map((day, index) => {
                                    const dayEvents = getDayEvents(day);
                                    return (
                                        <div key={index} className="col-12 col-md border-end">
                                            <div className={`p-3 ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                                                <h6 className="text-center mb-3">
                                                    {day.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric' })}
                                                </h6>
                                                {dayEvents.length === 0 ? (
                                                    <p className="text-muted text-center">Tidak ada acara</p>
                                                ) : (
                                                    <div className="d-flex flex-column gap-2">
                                                        {dayEvents.map((event, eventIndex) => (
                                                            <div
                                                                key={eventIndex}
                                                                className={`card ${STAGE_COLORS[event.stage]} text-white`}
                                                            >
                                                                <div className="card-body p-2">
                                                                    <h6 className="card-title mb-1">{event.title}</h6>
                                                                    <small>{formatDateTime(event.scheduledAt!)}</small>
                                                                    <div>
                                                                        <span className={`badge ${STATUS_COLORS[event.status]}`}>
                                                                            {STATUS_LABELS[event.status]}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {viewMode === 'month' && (
                            <table className={`table ${theme === 'dark' ? 'table-dark' : ''}`}>
                                <thead>
                                    <tr>
                                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                                            <th key={day} className="text-center">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: Math.ceil(getDaysInMonth.length / 7) }).map((_, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {Array.from({ length: 7 }).map((_, colIndex) => {
                                                const day = getDaysInMonth[rowIndex * 7 + colIndex];
                                                const dayEvents = day ? getDayEvents(day) : [];
                                                const isCurrentMonth = day && day.getMonth() === selectedDate.getMonth();

                                                return (
                                                    <td
                                                        key={colIndex}
                                                        className={`text-center p-1 ${!isCurrentMonth ? 'text-muted' : ''}`}
                                                        style={{ minHeight: '100px' }}
                                                    >
                                                        {day && (
                                                            <div>
                                                                <strong>{day.getDate()}</strong>
                                                                {dayEvents.slice(0, 2).map((event, eventIndex) => (
                                                                    <div
                                                                        key={eventIndex}
                                                                        className={`badge mb-1 ${STAGE_COLORS[event.stage]} text-white`}
                                                                        style={{
                                                                            fontSize: '10px',
                                                                            whiteSpace: 'nowrap',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            maxWidth: '100%',
                                                                        }}
                                                                    >
                                                                        {event.title}
                                                                    </div>
                                                                ))}
                                                                {dayEvents.length > 2 && (
                                                                    <small className="text-muted">
                                                                        +{dayEvents.length - 2} lagi
                                                                    </small>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {viewMode === 'day' && (
                            <div>
                                {events.length === 0 ? (
                                    <p className="text-muted text-center py-4">Tidak ada acara pada hari ini</p>
                                ) : (
                                    <div className="list-group">
                                        {events.map((event, index) => (
                                            <div key={index} className={`list-group-item list-group-item-action`}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <h6 className="mb-1">{event.title}</h6>
                                                        <small className="text-muted">
                                                            {formatDateTime(event.scheduledAt!)}
                                                        </small>
                                                    </div>
                                                    <div>
                                                        <span className={`badge ${STAGE_COLORS[event.stage]} me-1`}>
                                                            {STAGE_LABELS[event.stage]}
                                                        </span>
                                                        <span className={`badge ${STATUS_COLORS[event.status]}`}>
                                                            {STATUS_LABELS[event.status]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <small className="text-muted">Oleh: {event.createdBy}</small>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Legenda</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {Object.entries(STAGE_LABELS).map(([stage, label]) => (
                                <div key={stage} className="col-md-3 mb-2">
                                    <span className={`badge ${STAGE_COLORS[stage as PublishingWorkflowStage]} me-1`}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <hr />
                        <div className="row">
                            {Object.entries(STATUS_LABELS).map(([status, label]) => (
                                <div key={status} className="col-md-3">
                                    <span className={`badge bg-light ${STATUS_COLORS[status as CalendarEvent['status']]} me-1`}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

PublishingCalendar.displayName = 'PublishingCalendar';

export default memo(PublishingCalendar);
