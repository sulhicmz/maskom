import { BehaviorSignal, ContentType, UserProfile, UserSegment } from '@/types/personalization';

const STORAGE_KEY = 'user_behavior_history';
const MAX_HISTORY_SIZE = 500;
const BEHAVIOR_RETENTION_DAYS = 30;

class BehaviorTracker {
  private sessionId: string;
  private behaviorHistory: BehaviorSignal[] = [];
  private currentUserProfile: UserProfile | null = null;
  private sessionCounter: number = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadBehaviorHistory();
    this.cleanupOldBehaviors();
  }

  private generateSessionId(): string {
    this.sessionCounter++;
    return `session_${Date.now()}_${this.sessionCounter}_${Math.random().toString(36).substring(2, 9)}`;
  }

  loadBehaviorHistory(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.behaviorHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load behavior history:', error);
    }
  }

  private saveBehaviorHistory(): void {
    try {
      // Keep only the most recent behaviors
      const trimmed = this.behaviorHistory.slice(-MAX_HISTORY_SIZE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      this.behaviorHistory = trimmed;
    } catch (error) {
      console.error('Failed to save behavior history:', error);
    }
  }

  private cleanupOldBehaviors(): void {
    const cutoffTime = Date.now() - BEHAVIOR_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    this.behaviorHistory = this.behaviorHistory.filter((b) => b.timestamp > cutoffTime);
    this.saveBehaviorHistory();
  }

  trackPageView(contentType: ContentType, contentId: string, metadata?: Record<string, unknown>): void {
    const signal: BehaviorSignal = {
      id: this.generateId(),
      userId: this.getUserId(),
      sessionId: this.sessionId,
      type: 'page_view',
      contentType,
      contentId,
      metadata,
      timestamp: Date.now(),
    };
    this.addBehavior(signal);
  }

  trackScrollDepth(contentType: ContentType, contentId: string, depth: number): void {
    const signal: BehaviorSignal = {
      id: this.generateId(),
      userId: this.getUserId(),
      sessionId: this.sessionId,
      type: 'scroll_depth',
      contentType,
      contentId,
      value: depth,
      timestamp: Date.now(),
    };
    this.addBehavior(signal);
  }

  trackClick(contentType: ContentType, contentId: string, element?: string): void {
    const signal: BehaviorSignal = {
      id: this.generateId(),
      userId: this.getUserId(),
      sessionId: this.sessionId,
      type: 'click',
      contentType,
      contentId,
      metadata: { element },
      timestamp: Date.now(),
    };
    this.addBehavior(signal);
  }

  trackTimeOnPage(contentType: ContentType, contentId: string, durationMs: number): void {
    const signal: BehaviorSignal = {
      id: this.generateId(),
      userId: this.getUserId(),
      sessionId: this.sessionId,
      type: 'time_on_page',
      contentType,
      contentId,
      value: durationMs,
      timestamp: Date.now(),
    };
    this.addBehavior(signal);
  }

  trackBookmark(contentType: ContentType, contentId: string): void {
    const signal: BehaviorSignal = {
      id: this.generateId(),
      userId: this.getUserId(),
      sessionId: this.sessionId,
      type: 'bookmark',
      contentType,
      contentId,
      timestamp: Date.now(),
    };
    this.addBehavior(signal);
  }

  private addBehavior(signal: BehaviorSignal): void {
    this.behaviorHistory.push(signal);
    this.saveBehaviorHistory();
  }

  getBehaviorHistory(userId?: string): BehaviorSignal[] {
    if (userId) {
      return this.behaviorHistory.filter((b) => b.userId === userId);
    }
    return this.behaviorHistory.filter((b) => b.sessionId === this.sessionId);
  }

  getSessionBehaviors(): BehaviorSignal[] {
    return this.behaviorHistory.filter((b) => b.sessionId === this.sessionId);
  }

  getUserProfile(): UserProfile {
    if (this.currentUserProfile) {
      return this.currentUserProfile;
    }

    const behaviors = this.getSessionBehaviors();
    const segment = this.calculateSegment(behaviors);
    const interests = this.extractInterests(behaviors);
    const preferredContentType = this.calculatePreferredContentType(behaviors);
    const engagementScore = this.calculateEngagementScore(behaviors);

    this.currentUserProfile = {
      userId: this.getUserId(),
      sessionId: this.sessionId,
      segment,
      interests,
      preferredContentType,
      behaviorHistory: behaviors,
      engagementScore,
      lastActive: Date.now(),
      preferences: {
        allowPersonalization: (this.getPreference('allowPersonalization') as boolean) ?? true,
        allowTracking: (this.getPreference('allowTracking') as boolean) ?? true,
        theme: this.getPreference('theme') as 'light' | 'dark' | undefined,
        language: this.getPreference('language') as string | undefined,
      },
    };

    return this.currentUserProfile!;
  }

  updateUserProfile(updates: Partial<UserProfile>): void {
    const profile = this.getUserProfile();
    this.currentUserProfile = { ...profile, ...updates };
    this.savePreferences(updates.preferences || profile.preferences);
  }

  setOptOut(optedOut: boolean): void {
    const profile = this.getUserProfile();
    profile.preferences.allowPersonalization = !optedOut;
    profile.preferences.allowTracking = !optedOut;
    this.savePreferences(profile.preferences);
    this.currentUserProfile = profile;
  }

  isOptedOut(): boolean {
    const profile = this.getUserProfile();
    return !profile.preferences.allowPersonalization || !profile.preferences.allowTracking;
  }

  private calculateSegment(behaviors: BehaviorSignal[]): UserSegment {
    const uniqueSessions = new Set(behaviors.map((b) => b.sessionId)).size;
    const pageViews = behaviors.filter((b) => b.type === 'page_view').length;
    const bookmarks = behaviors.filter((b) => b.type === 'bookmark').length;
    const avgTimeOnPage = this.getAverageTimeOnPage(behaviors);
    const daysActive = this.getDaysActive(behaviors);

    if (uniqueSessions === 1 && pageViews <= 5) {
      return 'new_visitor';
    }

    if (daysActive >= 7 && pageViews >= 20 && avgTimeOnPage > 60000) {
      return 'frequent_reader';
    }

    if (bookmarks >= 5 && pageViews >= 15) {
      return 'engaged_user';
    }

    if (daysActive >= 30 && pageViews >= 50) {
      return 'content_creator';
    }

    const lastActive = behaviors.length > 0 ? behaviors[behaviors.length - 1].timestamp : 0;
    const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
    if (daysSinceActive > 14) {
      return 'dormant_user';
    }

    return 'returning_visitor';
  }

  private extractInterests(behaviors: BehaviorSignal[]): string[] {
    const categoryCounts = new Map<string, number>();
    
    behaviors.forEach((behavior) => {
      if (behavior.metadata?.category) {
        const category = String(behavior.metadata.category);
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      }
      if (behavior.metadata?.tag) {
        const tags = Array.isArray(behavior.metadata.tag) 
          ? behavior.metadata.tag.map(String)
          : [String(behavior.metadata.tag)];
        tags.forEach((tag) => {
          categoryCounts.set(tag, (categoryCounts.get(tag) || 0) + 1);
        });
      }
    });

    return Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((entry) => entry[0]);
  }

  private calculatePreferredContentType(behaviors: BehaviorSignal[]): ContentType {
    const typeCounts = new Map<ContentType, number>();
    
    behaviors.forEach((behavior) => {
      if (behavior.contentType) {
        typeCounts.set(behavior.contentType, (typeCounts.get(behavior.contentType) || 0) + 1);
      }
    });

    let maxCount = 0;
    let preferredType: ContentType = 'blog_post';
    
    typeCounts.forEach((count, type) => {
      if (count > maxCount) {
        maxCount = count;
        preferredType = type;
      }
    });

    return preferredType;
  }

  private calculateEngagementScore(behaviors: BehaviorSignal[]): number {
    const pageViews = behaviors.filter((b) => b.type === 'page_view').length;
    const clicks = behaviors.filter((b) => b.type === 'click').length;
    const bookmarks = behaviors.filter((b) => b.type === 'bookmark').length;
    const avgScrollDepth = this.getAverageScrollDepth(behaviors);
    const avgTimeOnPage = this.getAverageTimeOnPage(behaviors);

    const score = 
      (pageViews * 1) +
      (clicks * 0.5) +
      (bookmarks * 5) +
      (avgScrollDepth / 100) +
      (avgTimeOnPage / 60000 * 2);

    return Math.min(Math.round(score), 100);
  }

  private getAverageTimeOnPage(behaviors: BehaviorSignal[]): number {
    const timeOnPageSignals = behaviors.filter((b) => b.type === 'time_on_page' && b.value);
    if (timeOnPageSignals.length === 0) return 0;
    
    const total = timeOnPageSignals.reduce((sum, b) => sum + (b.value || 0), 0);
    return total / timeOnPageSignals.length;
  }

  private getAverageScrollDepth(behaviors: BehaviorSignal[]): number {
    const scrollSignals = behaviors.filter((b) => b.type === 'scroll_depth' && b.value);
    if (scrollSignals.length === 0) return 0;
    
    const total = scrollSignals.reduce((sum, b) => sum + (b.value || 0), 0);
    return total / scrollSignals.length;
  }

  private getDaysActive(behaviors: BehaviorSignal[]): number {
    const days = new Set(behaviors.map((b) => {
      const date = new Date(b.timestamp);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }));
    return days.size;
  }

  private getUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch {
      // Ignore
    }
    return undefined;
  }

  private getPreference(key: string): unknown {
    try {
      const prefs = localStorage.getItem('user_preferences');
      if (prefs) {
        const parsed = JSON.parse(prefs);
        return parsed[key];
      }
    } catch {
      // Ignore
    }
    return null;
  }

  private savePreferences(preferences: UserProfile['preferences']): void {
    try {
      const existing = localStorage.getItem('user_preferences');
      const parsed = existing ? JSON.parse(existing) : {};
      localStorage.setItem('user_preferences', JSON.stringify({ ...parsed, ...preferences }));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  clearSessionData(): void {
    this.behaviorHistory = this.behaviorHistory.filter((b) => b.sessionId !== this.sessionId);
    this.sessionId = this.generateSessionId();
    this.currentUserProfile = null;
    this.saveBehaviorHistory();
  }

  reset(): void {
    this.behaviorHistory = [];
    this.currentUserProfile = null;
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const behaviorTracker = new BehaviorTracker();
export { BehaviorTracker };
export default behaviorTracker;
