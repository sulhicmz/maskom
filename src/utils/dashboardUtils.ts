import { UserDashboardData, ReadingHistoryEntry, EngagementStats, ActivityEvent } from '@/types/dashboard';

const DASHBOARD_STORAGE_KEY = 'user_dashboard_data';

export const saveDashboardData = (data: UserDashboardData): void => {
    try {
        localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save dashboard data:', error);
    }
};

export const loadDashboardData = (): UserDashboardData | null => {
    try {
        const stored = localStorage.getItem(DASHBOARD_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as UserDashboardData;
        }
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
    return null;
};

export const calculateEngagementStats = (readingHistory: ReadingHistoryEntry[]): EngagementStats => {
    const totalPostsRead = readingHistory.filter(entry => entry.completed).length;
    const totalTimeSpent = readingHistory.reduce((sum, entry) => sum + entry.timeSpent, 0);
    
    const completedDates = readingHistory
        .filter(entry => entry.completed)
        .map(entry => new Date(entry.readAt).toDateString())
        .reverse();
    
    let currentStreak = 0;
    let today = new Date();
    let checkDate = new Date(today);
    
    for (const dateStr of completedDates) {
        if (dateStr === checkDate.toDateString()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return {
        totalPostsRead,
        totalBookmarksCreated: 0,
        totalTimeSpent,
        weeklyReadingGoal: 10,
        monthlyReadingGoal: 40,
        currentStreak
    };
};

export const getContinueReadingPosts = (readingHistory: ReadingHistoryEntry[]): ReadingHistoryEntry[] => {
    return readingHistory
        .filter(entry => !entry.completed && entry.progress > 0)
        .sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime())
        .slice(0, 5);
};

export const getActivityFeed = (activityEvents: ActivityEvent[], limit: number = 20): ActivityEvent[] => {
    return activityEvents
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
};

export const trackReadingProgress = (
    postId: string,
    postTitle: string,
    postSlug: string,
    thumbnail: string,
    progress: number,
    timeSpent: number
): void => {
    const dashboardData = loadDashboardData();
    if (!dashboardData) return;
    
    const existingEntry = dashboardData.readingHistory.find(entry => entry.postId === postId);
    
    if (existingEntry) {
        existingEntry.progress = progress;
        existingEntry.timeSpent = timeSpent;
        existingEntry.readAt = new Date().toISOString();
        
        if (progress >= 100 && !existingEntry.completed) {
            existingEntry.completed = true;
            addActivityEvent('read', postId, postTitle);
        }
    } else {
        const newEntry: ReadingHistoryEntry = {
            id: `rh-${Date.now()}`,
            postId,
            postTitle,
            postSlug,
            thumbnail,
            readAt: new Date().toISOString(),
            progress,
            timeSpent,
            completed: progress >= 100
        };
        
        dashboardData.readingHistory.unshift(newEntry);
        
        if (progress >= 100) {
            addActivityEvent('read', postId, postTitle);
        }
    }
    
    dashboardData.engagementStatistics = calculateEngagementStats(dashboardData.readingHistory);
    saveDashboardData(dashboardData);
};

export const addBookmark = (postId: string): void => {
    const dashboardData = loadDashboardData();
    if (!dashboardData) return;
    
    if (!dashboardData.bookmarks.includes(postId)) {
        dashboardData.bookmarks.push(parseInt(postId));
        dashboardData.engagementStatistics.totalBookmarksCreated++;
        saveDashboardData(dashboardData);
    }
};

export const removeBookmark = (postId: string): void => {
    const dashboardData = loadDashboardData();
    if (!dashboardData) return;
    
    const index = dashboardData.bookmarks.indexOf(parseInt(postId));
    if (index > -1) {
        dashboardData.bookmarks.splice(index, 1);
        saveDashboardData(dashboardData);
    }
};

export const addActivityEvent = (type: 'read' | 'bookmark' | 'comment' | 'share' | 'like', postId?: string, postTitle?: string): void => {
    const dashboardData = loadDashboardData();
    if (!dashboardData) return;
    
    const newEvent: ActivityEvent = {
        id: `act-${Date.now()}`,
        type,
        postId,
        postTitle,
        timestamp: new Date().toISOString()
    };
    
    dashboardData.activityFeed.unshift(newEvent);
    
    if (dashboardData.activityFeed.length > 100) {
        dashboardData.activityFeed = dashboardData.activityFeed.slice(0, 100);
    }
    
    saveDashboardData(dashboardData);
};

export const exportUserData = (): string => {
    const dashboardData = loadDashboardData();
    if (!dashboardData) return JSON.stringify({ error: 'No dashboard data found' });
    
    return JSON.stringify({
        exportDate: new Date().toISOString(),
        userDashboardData: dashboardData
    }, null, 2);
};

export const deleteUserData = (): void => {
    try {
        localStorage.removeItem(DASHBOARD_STORAGE_KEY);
    } catch (error) {
        console.error('Failed to delete dashboard data:', error);
    }
};
