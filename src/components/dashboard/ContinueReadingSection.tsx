"use client"

import React, { useState, useEffect, memo } from 'react'
import Image from 'next/image'
import { ReadingHistoryEntry } from '@/types/dashboard'
import { getContinueReadingPosts, loadDashboardData } from '@/utils/dashboardUtils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-toastify'

const ContinueReadingSection: React.FC = () => {
    const [posts, setPosts] = useState<ReadingHistoryEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadPosts = () => {
            try {
                const dashboardData = loadDashboardData()
                if (dashboardData) {
                    const continueReading = getContinueReadingPosts(dashboardData.readingHistory)
                    setPosts(continueReading)
                }
            } catch (error) {
                console.error('Failed to load continue reading posts:', error)
                toast.error('Gagal memuat postingan')
            } finally {
                setLoading(false)
            }
        }
        loadPosts()
    }, [])

    if (loading) {
        return <LoadingSpinner minHeight={200} color="primary" />
    }

    if (posts.length === 0) {
        return (
            <div className="card mb-4">
                <div className="card-body text-center py-5">
                    <div className="empty-state">
                        <span className="empty-icon">📖</span>
                        <h5>Tidak ada postingan yang sedang dibaca</h5>
                        <p className="text-muted">Mulai membaca postingan untuk melihatnya di sini</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="card mb-4">
            <div className="card-header">
                <h5 className="card-title mb-0">
                    <span className="section-icon">📖</span>
                    Lanjutkan Membaca
                </h5>
            </div>
            <div className="card-body">
                <div className="reading-list">
                    {posts.map(post => (
                        <div key={post.id} className="reading-item">
                            <div className="reading-thumbnail">
                                <Image
                                    src={post.thumbnail}
                                    alt={post.postTitle}
                                    width={80}
                                    height={80}
                                />
                                <div className="progress-overlay">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${post.progress}%` }}
                                    >
                                        {Math.round(post.progress)}%
                                    </div>
                                </div>
                            </div>
                            <div className="reading-content">
                                <h6 className="reading-title">
                                    <a href={`/blog/${post.postSlug}`}>{post.postTitle}</a>
                                </h6>
                                <div className="reading-meta">
                                    <span className="reading-time">
                                        ⏱️ {post.timeSpent} menit dibaca
                                    </span>
                                    <span className="reading-date">
                                        📅 {new Date(post.readAt).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                            </div>
                            <a
                                href={`/blog/${post.postSlug}`}
                                className="btn btn-primary btn-sm"
                            >
                                Lanjutkan
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

ContinueReadingSection.displayName = 'ContinueReadingSection'

export default memo(ContinueReadingSection)
