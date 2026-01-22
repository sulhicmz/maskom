export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type EventType = 'open' | 'click';

export interface EngagementEvent {
    id: string;
    campaignId: string;
    recipientId: string;
    eventType: EventType;
    timestamp: string;
    timezone: string;
}

export interface HourlyEngagementData {
    hour: number;
    openCount: number;
    clickCount: number;
    totalEvents: number;
    openRate: number;
    clickRate: number;
}

export interface DayOfWeekEngagementData {
    dayOfWeek: DayOfWeek;
    hourlyData: HourlyEngagementData[];
    totalOpens: number;
    totalClicks: number;
    totalEvents: number;
    averageOpenRate: number;
    averageClickRate: number;
}

export interface RecipientEngagementPattern {
    recipientId: string;
    engagementEvents: EngagementEvent[];
    optimalDay: DayOfWeek | null;
    optimalHour: number | null;
    timezone: string;
    lastUpdated: string;
}

export interface OptimalSendWindow {
    dayOfWeek: DayOfWeek;
    startHour: number;
    endHour: number;
    openRate: number;
    clickRate: number;
    confidenceScore: number;
    sampleSize: number;
}

export interface SendTimeInsights {
    campaignId?: string;
    recipientId?: string;
    dayOfWeekData: DayOfWeekEngagementData[];
    optimalWindows: OptimalSendWindow[];
    overallBestWindow: OptimalSendWindow | null;
    industryFallback: OptimalSendWindow;
    lastUpdated: string;
}

export interface TimezoneData {
    recipientId: string;
    timezone: string;
    autoDetected: boolean;
    lastDetected: string;
}

export interface ScheduleRecommendation {
    campaignId: string;
    recommendedSendTime: string;
    timezone: string;
    confidenceScore: number;
    expectedOpenRate: number;
    expectedClickRate: number;
    reason: string;
    alternativeOptions: Array<{
        sendTime: string;
        confidenceScore: number;
        expectedOpenRate: number;
        expectedClickRate: number;
    }>;
}

export interface IEmailScheduler {
    trackEngagementEvent(event: EngagementEvent): void;
    getEngagementPattern(recipientId: string): RecipientEngagementPattern | null;
    calculateOptimalSendTime(recipientId?: string, campaignId?: string): ScheduleRecommendation;
    getSendTimeInsights(recipientId?: string, campaignId?: string): SendTimeInsights;
    detectRecipientTimezone(recipientId: string, email: string): string;
    setTimezonePreference(recipientId: string, timezone: string): void;
    getOptimalWindows(campaignId?: string): OptimalSendWindow[];
    generateEngagementHeatmap(campaignId?: string): Map<DayOfWeek, HourlyEngagementData[]>;
    clearEngagementData(recipientId?: string): void;
    reset(): void;
}
