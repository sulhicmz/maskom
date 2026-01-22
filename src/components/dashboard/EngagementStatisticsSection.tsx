"use client"

import React, { useMemo, memo } from 'react'
import { EngagementStats } from '@/types/dashboard'

interface EngagementStatisticsSectionProps {
    statistics: EngagementStats
}

const EngagementStatisticsSection: React.FC<EngagementStatisticsSectionProps> = ({ statistics }) => {
    const stats = useMemo(() => [
        {
            label: 'Total Postingan Dibaca',
            value: statistics.totalPostsRead,
            icon: '📚',
            color: 'primary',
            progress: (statistics.totalPostsRead / statistics.monthlyReadingGoal) * 100
        },
        {
            label: 'Total Bookmark',
            value: statistics.totalBookmarksCreated,
            icon: '🔖',
            color: 'success',
            progress: 0
        },
        {
            label: 'Total Waktu Baca',
            value: `${statistics.totalTimeSpent} menit`,
            icon: '⏱️',
            color: 'info',
            progress: 0
        },
        {
            label: 'Streak Bacaan',
            value: `${statistics.currentStreak} hari`,
            icon: '🔥',
            color: 'warning',
            progress: 0
        }
    ], [statistics.totalPostsRead, statistics.totalBookmarksCreated, statistics.totalTimeSpent, statistics.currentStreak, statistics.monthlyReadingGoal])

    const weeklyProgress = useMemo(() => Math.min(
        Math.round((statistics.totalPostsRead / statistics.weeklyReadingGoal) * 100),
        100
    ), [statistics.totalPostsRead, statistics.weeklyReadingGoal])

    const monthlyProgress = useMemo(() => Math.min(
        Math.round((statistics.totalPostsRead / statistics.monthlyReadingGoal) * 100),
        100
    ), [statistics.totalPostsRead, statistics.monthlyReadingGoal])

    return (
        <div className="card mb-4">
            <div className="card-header">
                <h5 className="card-title mb-0">
                    <span className="section-icon">📈</span>
                    Statistik Keterlibatan
                </h5>
            </div>
            <div className="card-body">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon-wrapper">
                                <span className={`stat-icon stat-icon-${stat.color}`}>
                                    {stat.icon}
                                </span>
                            </div>
                            <div className="stat-content">
                                <h6 className="stat-value">{stat.value}</h6>
                                <p className="stat-label">{stat.label}</p>
                                {stat.progress > 0 && (
                                    <div className="progress mt-2">
                                        <div
                                            className={`progress-bar bg-${stat.color}`}
                                            role="progressbar"
                                            style={{ width: `${Math.min(stat.progress, 100)}%` }}
                                            aria-valuenow={stat.progress}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        >
                                            {Math.round(stat.progress)}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="reading-goals mt-4">
                    <h6 className="goals-title">Target Bacaan</h6>
                    <div className="goals-grid">
                        <div className="goal-card">
                            <div className="goal-header">
                                <span className="goal-icon">📅</span>
                                <span className="goal-label">Mingguan</span>
                            </div>
                            <div className="goal-content">
                                <div className="goal-progress">
                                    <div className="progress">
                                        <div
                                            className="progress-bar bg-success"
                                            style={{
                                                width: `${weeklyProgress}%`
                                            }}
                                            role="progressbar"
                                        >
                                            {weeklyProgress}%
                                        </div>
                                    </div>
                                </div>
                                <p className="goal-detail">
                                    {statistics.totalPostsRead} / {statistics.weeklyReadingGoal} postingan
                                </p>
                            </div>
                        </div>

                        <div className="goal-card">
                            <div className="goal-header">
                                <span className="goal-icon">📆</span>
                                <span className="goal-label">Bulanan</span>
                            </div>
                            <div className="goal-content">
                                <div className="goal-progress">
                                    <div className="progress">
                                        <div
                                            className="progress-bar bg-primary"
                                            style={{
                                                width: `${monthlyProgress}%`
                                            }}
                                            role="progressbar"
                                        >
                                            {monthlyProgress}%
                                        </div>
                                    </div>
                                </div>
                                <p className="goal-detail">
                                    {statistics.totalPostsRead} / {statistics.monthlyReadingGoal} postingan
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

EngagementStatisticsSection.displayName = 'EngagementStatisticsSection'

export default memo(EngagementStatisticsSection)
