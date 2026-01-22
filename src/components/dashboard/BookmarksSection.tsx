"use client"

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { UserDashboardData } from '@/types/dashboard'
import { loadDashboardData, removeBookmark } from '@/utils/dashboardUtils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-toastify'
import InnerBlogData from '@/data/InnerBlogData'

const BookmarksSection: React.FC = () => {
    const { theme } = useTheme()
    const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    useEffect(() => {
        const loadBookmarks = () => {
            try {
                const data = loadDashboardData()
                setDashboardData(data)
            } catch (error) {
                console.error('Failed to load bookmarks:', error)
                toast.error('Gagal memuat bookmark')
            } finally {
                setLoading(false)
            }
        }
        loadBookmarks()
    }, [])

    const handleRemoveBookmark = (postId: string) => {
        removeBookmark(postId)
        const updated = loadDashboardData()
        setDashboardData(updated)
        toast.success('Bookmark dihapus')
    }

    if (loading || !dashboardData) {
        return <LoadingSpinner minHeight={200} color="primary" />
    }

    const bookmarkedPosts = dashboardData.bookmarks
        .map(id => InnerBlogData.find(post => post.id === id))
        .filter(post => post !== undefined)

    if (bookmarkedPosts.length === 0) {
        return (
            <div className="card mb-4">
                <div className="card-body text-center py-5">
                    <div className="empty-state">
                        <span className="empty-icon">🔖</span>
                        <h5>Belum ada bookmark</h5>
                        <p className="text-muted">Tambahkan postingan ke bookmark untuk akses cepat</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="card mb-4">
            <div className="card-header">
                <div className="card-header-content">
                    <h5 className="card-title mb-0">
                        <span className="section-icon">🔖</span>
                        Bookmark
                    </h5>
                    <div className="view-toggle">
                        <button
                            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setViewMode('grid')}
                            title="Tampilan Grid"
                        >
                            ⊞
                        </button>
                        <button
                            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setViewMode('list')}
                            title="Tampilan Daftar"
                        >
                            ≣
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body">
                {viewMode === 'grid' ? (
                    <div className="grid-view">
                        <div className="row">
                            {bookmarkedPosts.map(post => (
                                <div key={post.id} className="col-lg-4 col-md-6 mb-4">
                                    <div className="bookmark-card">
                                        <div className="card-img-top">
                                            <img src={post.thumbnail || '/assets/images/blog/blog-1.jpg'} alt={post.title} />
                                        </div>
                                        <div className="card-body">
                                            <h6 className="card-title">
                                                <a href={`/blog/${post.slug}`}>{post.title}</a>
                                            </h6>
                                            <div className="bookmark-actions">
                                                <a href={`/blog/${post.slug}`} className="btn btn-primary btn-sm">
                                                    Baca
                                                </a>
                                                <button 
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleRemoveBookmark(post.id.toString())}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="list-view">
                        {bookmarkedPosts.map(post => (
                            <div key={post.id} className="bookmark-list-item">
                                <div className="bookmark-thumbnail">
                                    <img src={post.thumbnail || '/assets/images/blog/blog-1.jpg'} alt={post.title} />
                                </div>
                                <div className="bookmark-content">
                                    <h6 className="bookmark-title">
                                        <a href={`/blog/${post.slug}`}>{post.title}</a>
                                    </h6>
                                    <span className="bookmark-date">
                                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('id-ID') : '-'}
                                    </span>
                                </div>
                                <div className="bookmark-actions">
                                    <a href={`/blog/${post.slug}`} className="btn btn-primary btn-sm">
                                        Baca
                                    </a>
                                    <button 
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleRemoveBookmark(post.id.toString())}
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BookmarksSection
