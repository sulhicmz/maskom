export interface ReadingHistoryEntry {
    id: string;
    postId: string;
    postTitle: string;
    postSlug: string;
    thumbnail: string;
    readAt: string;
    progress: number;
    timeSpent: number;
    completed: boolean;
}

export interface EngagementStats {
    totalPostsRead: number;
    totalBookmarksCreated: number;
    totalTimeSpent: number;
    weeklyReadingGoal: number;
    monthlyReadingGoal: number;
    currentStreak: number;
}

export interface NotificationPreferences {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newPostsNotifications: boolean;
    commentReplyNotifications: boolean;
    weeklyDigest: boolean;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'id';
    notificationSettings: NotificationPreferences;
}

export interface AccessibilitySettings {
    fontSize: 100 | 110 | 125 | 150;
    highContrastMode: boolean;
    reducedMotion: boolean;
    screenReaderOptimized: boolean;
}

export interface ActivityEvent {
    id: string;
    type: 'read' | 'bookmark' | 'comment' | 'share' | 'like';
    postId?: string;
    postTitle?: string;
    timestamp: string;
}

export interface UserDashboardData {
    readingHistory: ReadingHistoryEntry[];
    bookmarks: number[];
    engagementStatistics: EngagementStats;
    activityFeed: ActivityEvent[];
    preferences: UserPreferences;
    accessibilitySettings: AccessibilitySettings;
}
