import { UserDashboardData } from '@/types/dashboard';

export const sampleDashboardData: UserDashboardData = {
    readingHistory: [
        {
            id: 'rh-1',
            postId: '1',
            postTitle: 'Panduan Lengkap Pemrograman React',
            postSlug: 'panduan-lengkap-pemrograman-react',
            thumbnail: '/assets/images/blog/blog-1.jpg',
            readAt: '2026-01-22T10:30:00Z',
            progress: 100,
            timeSpent: 15,
            completed: true
        },
        {
            id: 'rh-2',
            postId: '2',
            postTitle: 'Tips Optimalisasi Performa Website',
            postSlug: 'tips-optimalisasi-performa-website',
            thumbnail: '/assets/images/blog/blog-2.jpg',
            readAt: '2026-01-21T14:45:00Z',
            progress: 65,
            timeSpent: 8,
            completed: false
        },
        {
            id: 'rh-3',
            postId: '3',
            postTitle: 'Pengenalan TypeScript untuk Pemula',
            postSlug: 'pengenalan-typescript-untuk-pemula',
            thumbnail: '/assets/images/blog/blog-3.jpg',
            readAt: '2026-01-20T09:15:00Z',
            progress: 100,
            timeSpent: 12,
            completed: true
        }
    ],
    bookmarks: [1, 3, 5],
    engagementStatistics: {
        totalPostsRead: 42,
        totalBookmarksCreated: 15,
        totalTimeSpent: 580,
        weeklyReadingGoal: 10,
        monthlyReadingGoal: 40,
        currentStreak: 7
    },
    activityFeed: [
        {
            id: 'act-1',
            type: 'read',
            postId: '1',
            postTitle: 'Panduan Lengkap Pemrograman React',
            timestamp: '2026-01-22T10:30:00Z'
        },
        {
            id: 'act-2',
            type: 'bookmark',
            postId: '3',
            postTitle: 'Pengenalan TypeScript untuk Pemula',
            timestamp: '2026-01-21T16:20:00Z'
        },
        {
            id: 'act-3',
            type: 'comment',
            postId: '2',
            postTitle: 'Tips Optimalisasi Performa Website',
            timestamp: '2026-01-20T11:30:00Z'
        }
    ],
    preferences: {
        theme: 'auto',
        language: 'id',
        notificationSettings: {
            emailNotifications: true,
            pushNotifications: false,
            newPostsNotifications: true,
            commentReplyNotifications: true,
            weeklyDigest: false
        }
    },
    accessibilitySettings: {
        fontSize: 100,
        highContrastMode: false,
        reducedMotion: false,
        screenReaderOptimized: false
    }
};
