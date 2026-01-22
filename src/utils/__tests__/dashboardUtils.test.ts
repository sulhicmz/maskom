import {
    saveDashboardData,
    loadDashboardData,
    calculateEngagementStats,
    getContinueReadingPosts,
    getActivityFeed,
    trackReadingProgress,
    addBookmark,
    removeBookmark,
    addActivityEvent,
    exportUserData,
    deleteUserData
} from '../dashboardUtils';
import type { UserDashboardData, ReadingHistoryEntry, ActivityEvent } from '../../types/dashboard';

describe('dashboardUtils', () => {
    const DASHBOARD_STORAGE_KEY = 'user_dashboard_data';
    const mockDashboardData: UserDashboardData = {
        readingHistory: [],
        bookmarks: [],
        activityFeed: [],
        engagementStatistics: {
            totalPostsRead: 0,
            totalBookmarksCreated: 0,
            totalTimeSpent: 0,
            weeklyReadingGoal: 10,
            monthlyReadingGoal: 40,
            currentStreak: 0
        },
        preferences: {
            theme: 'light',
            language: 'id',
            notificationSettings: {
                emailNotifications: true,
                pushNotifications: true,
                newPostsNotifications: true,
                commentReplyNotifications: true,
                weeklyDigest: true
            }
        },
        accessibilitySettings: {
            fontSize: 100,
            highContrastMode: false,
            reducedMotion: false,
            screenReaderOptimized: false
        }
    };

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('saveDashboardData', () => {
        it('should save dashboard data to localStorage', () => {
            saveDashboardData(mockDashboardData);
            const stored = localStorage.getItem(DASHBOARD_STORAGE_KEY);
            expect(stored).toBeTruthy();
            expect(JSON.parse(stored!)).toEqual(mockDashboardData);
        });

        it('should handle localStorage errors gracefully', () => {
            const mockError = new Error('Storage quota exceeded');
            jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
                throw mockError;
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            saveDashboardData(mockDashboardData);

            expect(consoleSpy).toHaveBeenCalledWith('Failed to save dashboard data:', mockError);
            consoleSpy.mockRestore();
        });
    });

    describe('loadDashboardData', () => {
        it('should load dashboard data from localStorage', () => {
            localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(mockDashboardData));
            const loaded = loadDashboardData();
            expect(loaded).toEqual(mockDashboardData);
        });

        it('should return null when no data exists', () => {
            const loaded = loadDashboardData();
            expect(loaded).toBeNull();
        });

        it('should handle corrupted data gracefully', () => {
            localStorage.setItem(DASHBOARD_STORAGE_KEY, '{ invalid json');
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const loaded = loadDashboardData();
            expect(loaded).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should handle localStorage errors gracefully', () => {
            const mockError = new Error('Access denied');
            jest.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
                throw mockError;
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const loaded = loadDashboardData();

            expect(loaded).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith('Failed to load dashboard data:', mockError);
            consoleSpy.mockRestore();
        });
    });

    describe('calculateEngagementStats', () => {
        it('should calculate total posts read', () => {
            const readingHistory: ReadingHistoryEntry[] = [
                { id: '1', postId: '1', postTitle: 'Post 1', postSlug: 'post-1', thumbnail: '', readAt: new Date().toISOString(), progress: 100, timeSpent: 300, completed: true },
                { id: '2', postId: '2', postTitle: 'Post 2', postSlug: 'post-2', thumbnail: '', readAt: new Date().toISOString(), progress: 100, timeSpent: 400, completed: true },
                { id: '3', postId: '3', postTitle: 'Post 3', postSlug: 'post-3', thumbnail: '', readAt: new Date().toISOString(), progress: 50, timeSpent: 200, completed: false }
            ];

            const stats = calculateEngagementStats(readingHistory);
            expect(stats.totalPostsRead).toBe(2);
        });

        it('should calculate total time spent reading', () => {
            const readingHistory: ReadingHistoryEntry[] = [
                { id: '1', postId: '1', postTitle: 'Post 1', postSlug: 'post-1', thumbnail: '', readAt: new Date().toISOString(), progress: 100, timeSpent: 300, completed: true },
                { id: '2', postId: '2', postTitle: 'Post 2', postSlug: 'post-2', thumbnail: '', readAt: new Date().toISOString(), progress: 100, timeSpent: 400, completed: true }
            ];

            const stats = calculateEngagementStats(readingHistory);
            expect(stats.totalTimeSpent).toBe(700);
        });

        it('should calculate current streak for consecutive days', () => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const dayBefore = new Date(today);
            dayBefore.setDate(dayBefore.getDate() - 2);

            const readingHistory: ReadingHistoryEntry[] = [
                { id: '1', postId: '1', postTitle: 'Post 1', postSlug: 'post-1', thumbnail: '', readAt: dayBefore.toISOString(), progress: 100, timeSpent: 300, completed: true },
                { id: '2', postId: '2', postTitle: 'Post 2', postSlug: 'post-2', thumbnail: '', readAt: yesterday.toISOString(), progress: 100, timeSpent: 400, completed: true },
                { id: '3', postId: '3', postTitle: 'Post 3', postSlug: 'post-3', thumbnail: '', readAt: today.toISOString(), progress: 100, timeSpent: 200, completed: true }
            ];

            const stats = calculateEngagementStats(readingHistory);
            expect(stats.currentStreak).toBe(3);
        });

        it('should return zero streak when no completed posts', () => {
            const readingHistory: ReadingHistoryEntry[] = [
                { id: '1', postId: '1', postTitle: 'Post 1', postSlug: 'post-1', thumbnail: '', readAt: new Date().toISOString(), progress: 50, timeSpent: 200, completed: false }
            ];

            const stats = calculateEngagementStats(readingHistory);
            expect(stats.currentStreak).toBe(0);
        });

        it('should break streak when day is missing', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            const readingHistory: ReadingHistoryEntry[] = [
                { id: '1', postId: '1', postTitle: 'Post 1', postSlug: 'post-1', thumbnail: '', readAt: yesterday.toISOString(), progress: 100, timeSpent: 300, completed: true },
                { id: '2', postId: '2', postTitle: 'Post 2', postSlug: 'post-2', thumbnail: '', readAt: twoDaysAgo.toISOString(), progress: 100, timeSpent: 400, completed: true }
            ];

            const stats = calculateEngagementStats(readingHistory);
            expect(stats.currentStreak).toBe(0);
        });

        it('should set default reading goals', () => {
            const readingHistory: ReadingHistoryEntry[] = [];
            const stats = calculateEngagementStats(readingHistory);
            expect(stats.weeklyReadingGoal).toBe(10);
            expect(stats.monthlyReadingGoal).toBe(40);
        });

        it('should handle empty reading history', () => {
            const readingHistory: ReadingHistoryEntry[] = [];
            const stats = calculateEngagementStats(readingHistory);
            expect(stats.totalPostsRead).toBe(0);
            expect(stats.totalTimeSpent).toBe(0);
            expect(stats.currentStreak).toBe(0);
        });
    });

    describe('getContinueReadingPosts', () => {
        it('should return incomplete posts with progress > 0', () => {
            const readingHistory: ReadingHistoryEntry[] = [
                { id: '1', postId: '1', postTitle: 'Post 1', postSlug: 'post-1', thumbnail: '', readAt: new Date(Date.now() - 3600000).toISOString(), progress: 50, timeSpent: 200, completed: false },
                { id: '2', postId: '2', postTitle: 'Post 2', postSlug: 'post-2', thumbnail: '', readAt: new Date().toISOString(), progress: 75, timeSpent: 300, completed: false },
                { id: '3', postId: '3', postTitle: 'Post 3', postSlug: 'post-3', thumbnail: '', readAt: new Date().toISOString(), progress: 100, timeSpent: 400, completed: true }
            ];

            const result = getContinueReadingPosts(readingHistory);
            expect(result).toHaveLength(2);
            expect(result[0].postId).toBe('2');
            expect(result[1].postId).toBe('1');
        });

        it('should exclude completed posts', () => {
            const readingHistory: ReadingHistoryEntry[] = [
                { id: '1', postId: '1', postTitle: 'Post 1', postSlug: 'post-1', thumbnail: '', readAt: new Date().toISOString(), progress: 100, timeSpent: 400, completed: true },
                { id: '2', postId: '2', postTitle: 'Post 2', postSlug: 'post-2', thumbnail: '', readAt: new Date().toISOString(), progress: 100, timeSpent: 300, completed: true }
            ];

            const result = getContinueReadingPosts(readingHistory);
            expect(result).toHaveLength(0);
        });

        it('should exclude posts with zero progress', () => {
            const readingHistory: ReadingHistoryEntry[] = [
                { id: '1', postId: '1', postTitle: 'Post 1', postSlug: 'post-1', thumbnail: '', readAt: new Date().toISOString(), progress: 0, timeSpent: 0, completed: false },
                { id: '2', postId: '2', postTitle: 'Post 2', postSlug: 'post-2', thumbnail: '', readAt: new Date().toISOString(), progress: 50, timeSpent: 200, completed: false }
            ];

            const result = getContinueReadingPosts(readingHistory);
            expect(result).toHaveLength(1);
            expect(result[0].postId).toBe('2');
        });

        it('should limit to 5 posts', () => {
            const readingHistory: ReadingHistoryEntry[] = Array.from({ length: 10 }, (_, i) => ({
                id: `rh-${i}`,
                postId: `${i}`,
                postTitle: `Post ${i}`,
                postSlug: `post-${i}`,
                thumbnail: '',
                readAt: new Date(Date.now() - i * 3600000).toISOString(),
                progress: 50 + i * 5,
                timeSpent: 200,
                completed: false
            }));

            const result = getContinueReadingPosts(readingHistory);
            expect(result).toHaveLength(5);
        });

        it('should return empty array when no continue reading posts', () => {
            const readingHistory: ReadingHistoryEntry[] = [];
            const result = getContinueReadingPosts(readingHistory);
            expect(result).toHaveLength(0);
        });
    });

    describe('getActivityFeed', () => {
        it('should return activity feed sorted by timestamp (newest first)', () => {
            const baseTime = new Date('2026-01-22T10:00:00.000Z');
            const activityEvents: ActivityEvent[] = [
                { id: 'act-1', type: 'read', postId: '1', postTitle: 'Post 1', timestamp: new Date(baseTime.getTime() - 3600000).toISOString() },
                { id: 'act-2', type: 'bookmark', postId: '2', postTitle: 'Post 2', timestamp: baseTime.toISOString() },
                { id: 'act-3', type: 'comment', postId: '3', postTitle: 'Post 3', timestamp: new Date(baseTime.getTime() - 7200000).toISOString() }
            ];

            const result = getActivityFeed(activityEvents);
            expect(result[0].id).toBe('act-2');
            expect(result[1].id).toBe('act-1');
            expect(result[2].id).toBe('act-3');
        });

        it('should limit activity feed to specified limit', () => {
            const activityEvents: ActivityEvent[] = Array.from({ length: 30 }, (_, i) => ({
                id: `act-${i}`,
                type: 'read',
                postId: `${i}`,
                postTitle: `Post ${i}`,
                timestamp: new Date(Date.now() - i * 3600000).toISOString()
            }));

            const result = getActivityFeed(activityEvents, 10);
            expect(result).toHaveLength(10);
        });

        it('should use default limit of 20 when not specified', () => {
            const activityEvents: ActivityEvent[] = Array.from({ length: 25 }, (_, i) => ({
                id: `act-${i}`,
                type: 'read',
                postId: `${i}`,
                postTitle: `Post ${i}`,
                timestamp: new Date(Date.now() - i * 3600000).toISOString()
            }));

            const result = getActivityFeed(activityEvents);
            expect(result).toHaveLength(20);
        });

        it('should return empty array when no activity events', () => {
            const result = getActivityFeed([]);
            expect(result).toHaveLength(0);
        });
    });

    describe('trackReadingProgress', () => {
        beforeEach(() => {
            saveDashboardData(mockDashboardData);
        });

        it('should create new reading history entry for new post', () => {
            trackReadingProgress('123', 'Test Post', 'test-post', '/thumb.jpg', 25, 120);

            const loaded = loadDashboardData();
            expect(loaded?.readingHistory).toHaveLength(1);
            expect(loaded?.readingHistory[0].postId).toBe('123');
            expect(loaded?.readingHistory[0].progress).toBe(25);
        });

        it('should update existing reading history entry', () => {
            trackReadingProgress('123', 'Test Post', 'test-post', '/thumb.jpg', 25, 120);
            trackReadingProgress('123', 'Test Post', 'test-post', '/thumb.jpg', 50, 240);

            const loaded = loadDashboardData();
            expect(loaded?.readingHistory).toHaveLength(1);
            expect(loaded?.readingHistory[0].progress).toBe(50);
            expect(loaded?.readingHistory[0].timeSpent).toBe(240);
        });

        it('should mark post as completed when progress reaches 100', () => {
            trackReadingProgress('123', 'Test Post', 'test-post', '/thumb.jpg', 100, 300);

            const loaded = loadDashboardData();
            expect(loaded?.readingHistory[0].completed).toBe(true);
        });

        it('should add activity event when post is completed', () => {
            trackReadingProgress('123', 'Test Post', 'test-post', '/thumb.jpg', 100, 300);

            const loaded = loadDashboardData();
            expect(loaded?.readingHistory[0].completed).toBe(true);
        });


        it('should add activity event for existing entry when completed', () => {
            trackReadingProgress('123', 'Test Post', 'test-post', '/thumb.jpg', 90, 270);
            trackReadingProgress('123', 'Test Post', 'test-post', '/thumb.jpg', 100, 300);

            const loaded = loadDashboardData();
            expect(loaded?.readingHistory).toHaveLength(1);
            expect(loaded?.readingHistory[0].completed).toBe(true);
            expect(loaded?.readingHistory[0].progress).toBe(100);
        });

        it('should update engagement statistics', () => {
            const history: ReadingHistoryEntry[] = [
                { id: 'rh-1', postId: '1', postTitle: 'Post 1', postSlug: 'post-1', thumbnail: '', readAt: new Date().toISOString(), progress: 100, timeSpent: 300, completed: true }
            ];
            mockDashboardData.readingHistory = history;
            mockDashboardData.engagementStatistics.totalPostsRead = 1;
            saveDashboardData(mockDashboardData);

            trackReadingProgress('2', 'Post 2', 'post-2', '/thumb.jpg', 100, 300);

            const loaded = loadDashboardData();
            expect(loaded?.engagementStatistics.totalPostsRead).toBe(2);
        });

        it('should do nothing when dashboard data is not loaded', () => {
            localStorage.clear();
            trackReadingProgress('123', 'Test Post', 'test-post', '/thumb.jpg', 50, 120);

            expect(loadDashboardData()).toBeNull();
        });
    });

    describe('addBookmark', () => {
        beforeEach(() => {
            saveDashboardData(mockDashboardData);
        });

        it('should add bookmark for post', () => {
            addBookmark('123');

            const loaded = loadDashboardData();
            expect(loaded?.bookmarks).toContain(123);
        });

        it('should increment bookmark count in engagement stats', () => {
            addBookmark('123');

            const loaded = loadDashboardData();
            expect(loaded?.engagementStatistics.totalBookmarksCreated).toBe(1);
        });

        it('should not add duplicate bookmark', () => {
            addBookmark('123');
            addBookmark('123');

            const loaded = loadDashboardData();
            const bookmarkCount = loaded?.bookmarks.filter(id => id === 123).length;
            expect(bookmarkCount).toBe(1);
            expect(loaded?.engagementStatistics.totalBookmarksCreated).toBe(1);
        });

        it('should convert string postId to number', () => {
            addBookmark('456');

            const loaded = loadDashboardData();
            expect(typeof loaded?.bookmarks[0]).toBe('number');
            expect(loaded?.bookmarks[0]).toBe(456);
        });

        it('should handle numeric postId', () => {
            addBookmark('789');

            const loaded = loadDashboardData();
            expect(loaded?.bookmarks).toContain(789);
        });

        it('should do nothing when dashboard data is not loaded', () => {
            localStorage.clear();
            addBookmark('123');

            expect(loadDashboardData()).toBeNull();
        });
    });

    describe('removeBookmark', () => {
        beforeEach(() => {
            mockDashboardData.bookmarks = [123, 456, 789];
            saveDashboardData(mockDashboardData);
        });

        it('should remove bookmark by postId', () => {
            removeBookmark('123');

            const loaded = loadDashboardData();
            expect(loaded?.bookmarks).not.toContain(123);
            expect(loaded?.bookmarks).toHaveLength(2);
        });

        it('should handle bookmark that does not exist', () => {
            const initialLength = mockDashboardData.bookmarks.length;
            removeBookmark('999');

            const loaded = loadDashboardData();
            expect(loaded?.bookmarks).toHaveLength(initialLength);
        });

        it('should do nothing when dashboard data is not loaded', () => {
            localStorage.clear();
            removeBookmark('123');

            expect(loadDashboardData()).toBeNull();
        });
    });

    describe('addActivityEvent', () => {
        beforeEach(() => {
            saveDashboardData(mockDashboardData);
        });

        it('should add new activity event', () => {
            addActivityEvent('read', '123', 'Test Post');

            const loaded = loadDashboardData();
            expect(loaded?.activityFeed).toHaveLength(1);
            expect(loaded?.activityFeed[0].type).toBe('read');
            expect(loaded?.activityFeed[0].postId).toBe('123');
            expect(loaded?.activityFeed[0].postTitle).toBe('Test Post');
        });

        it('should add activity event without postId and postTitle', () => {
            addActivityEvent('like');

            const loaded = loadDashboardData();
            expect(loaded?.activityFeed).toHaveLength(1);
            expect(loaded?.activityFeed[0].type).toBe('like');
            expect(loaded?.activityFeed[0].postId).toBeUndefined();
            expect(loaded?.activityFeed[0].postTitle).toBeUndefined();
        });

        it('should add activity event to beginning of feed', () => {
            addActivityEvent('read', '1', 'Post 1');
            addActivityEvent('bookmark', '2', 'Post 2');

            const loaded = loadDashboardData();
            expect(loaded?.activityFeed[0].type).toBe('bookmark');
            expect(loaded?.activityFeed[1].type).toBe('read');
        });

        it('should limit activity feed to 100 events', () => {
            for (let i = 0; i < 105; i++) {
                addActivityEvent('read', `${i}`, `Post ${i}`);
            }

            const loaded = loadDashboardData();
            expect(loaded?.activityFeed).toHaveLength(100);
        });

        it('should do nothing when dashboard data is not loaded', () => {
            localStorage.clear();
            addActivityEvent('read', '123', 'Test Post');

            expect(loadDashboardData()).toBeNull();
        });

        it('should accept all valid event types', () => {
            addActivityEvent('read', '1', 'Post 1');
            addActivityEvent('bookmark', '2', 'Post 2');
            addActivityEvent('comment', '3', 'Post 3');
            addActivityEvent('share', '4', 'Post 4');
            addActivityEvent('like', '5', 'Post 5');

            const loaded = loadDashboardData();
            expect(loaded?.activityFeed).toHaveLength(5);
        });
    });

    describe('exportUserData', () => {
        beforeEach(() => {
            saveDashboardData(mockDashboardData);
        });

        it('should export dashboard data as JSON string', () => {
            const exported = exportUserData();
            const parsed = JSON.parse(exported);

            expect(parsed).toHaveProperty('exportDate');
            expect(parsed).toHaveProperty('userDashboardData');
            expect(parsed.userDashboardData).toHaveProperty('readingHistory');
            expect(parsed.userDashboardData).toHaveProperty('bookmarks');
        });

        it('should include export timestamp', () => {
            const exported = exportUserData();
            const parsed = JSON.parse(exported);

            expect(parsed.exportDate).toBeTruthy();
            expect(new Date(parsed.exportDate).toISOString()).toBe(parsed.exportDate);
        });

        it('should return error when no dashboard data exists', () => {
            localStorage.clear();
            const exported = exportUserData();
            const parsed = JSON.parse(exported);

            expect(parsed).toHaveProperty('error');
            expect(parsed.error).toBe('No dashboard data found');
        });

        it('should format JSON with 2 spaces for readability', () => {
            const exported = exportUserData();

            expect(exported).toContain('\n');
            expect(exported).toContain('  ');
        });
    });

    describe('deleteUserData', () => {
        beforeEach(() => {
            saveDashboardData(mockDashboardData);
        });

        it('should remove dashboard data from localStorage', () => {
            expect(loadDashboardData()).not.toBeNull();
            deleteUserData();
            expect(loadDashboardData()).toBeNull();
        });

        it('should handle localStorage errors gracefully', () => {
            const mockError = new Error('Access denied');
            jest.spyOn(Storage.prototype, 'removeItem').mockImplementationOnce(() => {
                throw mockError;
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            deleteUserData();

            expect(consoleSpy).toHaveBeenCalledWith('Failed to delete dashboard data:', mockError);
            consoleSpy.mockRestore();
        });

        it('should handle missing data gracefully', () => {
            localStorage.clear();
            expect(() => deleteUserData()).not.toThrow();
            expect(loadDashboardData()).toBeNull();
        });
    });
});
