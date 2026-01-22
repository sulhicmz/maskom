import type {
    IEmailScheduler,
    EngagementEvent,
    HourlyEngagementData,
    DayOfWeekEngagementData,
    RecipientEngagementPattern,
    OptimalSendWindow,
    SendTimeInsights,
    TimezoneData,
    ScheduleRecommendation,
    DayOfWeek,
} from '@/types/emailScheduler';

const STORAGE_KEYS = {
    ENGAGEMENT_EVENTS: 'email_scheduler_engagement_events',
    RECIPIENT_PATTERNS: 'email_scheduler_recipient_patterns',
    TIMEZONE_DATA: 'email_scheduler_timezone_data',
} as const;

const DAYS_OF_WEEK: DayOfWeek[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const HOURS_IN_DAY = 24;

const INDUSTRY_FALLBACK: OptimalSendWindow = {
    dayOfWeek: 'Tuesday',
    startHour: 9,
    endHour: 11,
    openRate: 25.0,
    clickRate: 4.5,
    confidenceScore: 50.0,
    sampleSize: 0,
};

class EmailScheduler implements IEmailScheduler {
    private engagementEvents: EngagementEvent[];
    private recipientPatterns: Map<string, RecipientEngagementPattern>;
    private timezoneData: Map<string, TimezoneData>;

    constructor() {
        this.engagementEvents = this.loadEngagementEvents();
        this.recipientPatterns = this.loadRecipientPatterns();
        this.timezoneData = this.loadTimezoneData();
    }

    private loadEngagementEvents(): EngagementEvent[] {
        const stored = localStorage.getItem(STORAGE_KEYS.ENGAGEMENT_EVENTS);
        return stored ? JSON.parse(stored) : [];
    }

    private saveEngagementEvents(): void {
        localStorage.setItem(STORAGE_KEYS.ENGAGEMENT_EVENTS, JSON.stringify(this.engagementEvents));
    }

    private loadRecipientPatterns(): Map<string, RecipientEngagementPattern> {
        const stored = localStorage.getItem(STORAGE_KEYS.RECIPIENT_PATTERNS);
        const patterns: RecipientEngagementPattern[] = stored ? JSON.parse(stored) : [];
        return new Map(patterns.map((p) => [p.recipientId, p]));
    }

    private saveRecipientPatterns(): void {
        const patterns = Array.from(this.recipientPatterns.values());
        localStorage.setItem(STORAGE_KEYS.RECIPIENT_PATTERNS, JSON.stringify(patterns));
    }

    private loadTimezoneData(): Map<string, TimezoneData> {
        const stored = localStorage.getItem(STORAGE_KEYS.TIMEZONE_DATA);
        const data: TimezoneData[] = stored ? JSON.parse(stored) : [];
        return new Map(data.map((t) => [t.recipientId, t]));
    }

    private saveTimezoneData(): void {
        const data = Array.from(this.timezoneData.values());
        localStorage.setItem(STORAGE_KEYS.TIMEZONE_DATA, JSON.stringify(data));
    }

    trackEngagementEvent(event: EngagementEvent): void {
        this.engagementEvents.push(event);
        this.saveEngagementEvents();
        this.updateRecipientPattern(event.recipientId);
    }

    private updateRecipientPattern(recipientId: string): void {
        const recipientEvents = this.engagementEvents.filter(
            (e) => e.recipientId === recipientId
        );

        if (recipientEvents.length === 0) {
            return;
        }

        const timezone = this.timezoneData.get(recipientId)?.timezone || 'UTC';

        const hourlyData = new Map<number, { opens: number; clicks: number }>();

        recipientEvents.forEach((event) => {
            const date = new Date(event.timestamp);
            const hour = date.getHours();
            const dayOfWeek = this.getDayOfWeek(date);

            const key = dayOfWeek + '-' + hour;
            if (!hourlyData.has(key)) {
                hourlyData.set(key, { opens: 0, clicks: 0 });
            }

            const data = hourlyData.get(key)!;
            if (event.eventType === 'open') {
                data.opens++;
            } else if (event.eventType === 'click') {
                data.clicks++;
            }
        });

        const bestHour = this.findBestHour(recipientEvents);
        const bestDay = this.findBestDay(recipientEvents);

        const pattern: RecipientEngagementPattern = {
            recipientId,
            engagementEvents: recipientEvents,
            optimalDay: bestDay,
            optimalHour: bestHour,
            timezone,
            lastUpdated: new Date().toISOString(),
        };

        this.recipientPatterns.set(recipientId, pattern);
        this.saveRecipientPatterns();
    }

    private findBestHour(events: EngagementEvent[]): number | null {
        const hourlyEngagement = new Map<number, { opens: number; clicks: number }>();

        events.forEach((event) => {
            const hour = new Date(event.timestamp).getHours();
            if (!hourlyEngagement.has(hour)) {
                hourlyEngagement.set(hour, { opens: 0, clicks: 0 });
            }
            const data = hourlyEngagement.get(hour)!;
            if (event.eventType === 'open') {
                data.opens++;
            } else if (event.eventType === 'click') {
                data.clicks++;
            }
        });

        let bestHour: number | null = null;
        let maxScore = 0;

        hourlyEngagement.forEach((data, hour) => {
            const score = data.opens * 1 + data.clicks * 2;
            if (score > maxScore) {
                maxScore = score;
                bestHour = hour;
            }
        });

        return bestHour;
    }

    private findBestDay(events: EngagementEvent[]): DayOfWeek | null {
        const dayEngagement = new Map<DayOfWeek, { opens: number; clicks: number }>();

        events.forEach((event) => {
            const dayOfWeek = this.getDayOfWeek(new Date(event.timestamp));
            if (!dayEngagement.has(dayOfWeek)) {
                dayEngagement.set(dayOfWeek, { opens: 0, clicks: 0 });
            }
            const data = dayEngagement.get(dayOfWeek)!;
            if (event.eventType === 'open') {
                data.opens++;
            } else if (event.eventType === 'click') {
                data.clicks++;
            }
        });

        let bestDay: DayOfWeek | null = null;
        let maxScore = 0;

        dayEngagement.forEach((data, day) => {
            const score = data.opens * 1 + data.clicks * 2;
            if (score > maxScore) {
                maxScore = score;
                bestDay = day;
            }
        });

        return bestDay;
    }

    private getDayOfWeek(date: Date): DayOfWeek {
        const days: DayOfWeek[] = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];
        return days[date.getDay()];
    }

    getEngagementPattern(recipientId: string): RecipientEngagementPattern | null {
        return this.recipientPatterns.get(recipientId) || null;
    }

    calculateOptimalSendTime(recipientId?: string, campaignId?: string): ScheduleRecommendation {
        const insights = this.getSendTimeInsights(recipientId, campaignId);

        if (insights.overallBestWindow) {
            const recommendedTime = this.calculateNextOccurrence(
                insights.overallBestWindow.dayOfWeek,
                insights.overallBestWindow.startHour
            );

            return {
                campaignId: campaignId || '',
                recommendedSendTime: recommendedTime,
                timezone: this.getTimezone(recipientId),
                confidenceScore: insights.overallBestWindow.confidenceScore,
                expectedOpenRate: insights.overallBestWindow.openRate,
                expectedClickRate: insights.overallBestWindow.clickRate,
                reason: insights.overallBestWindow.sampleSize > 10
                    ? `Berdasarkan data ${insights.overallBestWindow.sampleSize} interaksi penerima`
                    : 'Berdasarkan data terbatas',
                alternativeOptions: insights.optimalWindows
                    .filter((w) => w !== insights.overallBestWindow)
                    .slice(0, 3)
                    .map((w) => ({
                        sendTime: this.calculateNextOccurrence(w.dayOfWeek, w.startHour),
                        confidenceScore: w.confidenceScore,
                        expectedOpenRate: w.openRate,
                        expectedClickRate: w.clickRate,
                    })),
            };
        }

        const fallbackTime = this.calculateNextOccurrence(
            INDUSTRY_FALLBACK.dayOfWeek,
            INDUSTRY_FALLBACK.startHour
        );

        return {
            campaignId: campaignId || '',
            recommendedSendTime: fallbackTime,
            timezone: this.getTimezone(recipientId),
            confidenceScore: INDUSTRY_FALLBACK.confidenceScore,
            expectedOpenRate: INDUSTRY_FALLBACK.openRate,
            expectedClickRate: INDUSTRY_FALLBACK.clickRate,
            reason: 'Berdasarkan benchmark industri (Selasa, 09:00 - 11:00)',
            alternativeOptions: [],
        };
    }

    private calculateNextOccurrence(dayOfWeek: DayOfWeek, hour: number): string {
        const targetDayIndex = DAYS_OF_WEEK.indexOf(dayOfWeek);
        const now = new Date();
        const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;

        let daysUntilTarget = targetDayIndex - currentDayIndex;
        if (daysUntilTarget < 0) {
            daysUntilTarget += 7;
        } else if (daysUntilTarget === 0 && now.getHours() >= hour) {
            daysUntilTarget += 7;
        }

        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + daysUntilTarget);
        targetDate.setHours(hour, 0, 0, 0);

        return targetDate.toISOString();
    }

    private getTimezone(recipientId?: string): string {
        if (recipientId) {
            return this.timezoneData.get(recipientId)?.timezone || 'UTC';
        }
        return 'UTC';
    }

    getSendTimeInsights(recipientId?: string, campaignId?: string): SendTimeInsights {
        let events = this.engagementEvents;

        if (campaignId) {
            events = events.filter((e) => e.campaignId === campaignId);
        }

        if (recipientId) {
            events = events.filter((e) => e.recipientId === recipientId);
        }

        const dayOfWeekData = this.calculateDayOfWeekData(events);
        const optimalWindows = this.calculateOptimalWindows(dayOfWeekData);
        const overallBestWindow = optimalWindows[0] || null;

        return {
            campaignId,
            recipientId,
            dayOfWeekData,
            optimalWindows,
            overallBestWindow,
            industryFallback: INDUSTRY_FALLBACK,
            lastUpdated: new Date().toISOString(),
        };
    }

    private calculateDayOfWeekData(events: EngagementEvent[]): DayOfWeekEngagementData[] {
        const dayMap = new Map<DayOfWeek, Map<number, { opens: number; clicks: number }>>();

        DAYS_OF_WEEK.forEach((day) => {
            dayMap.set(day, new Map());
            for (let i = 0; i < HOURS_IN_DAY; i++) {
                dayMap.get(day)!.set(i, { opens: 0, clicks: 0 });
            }
        });

        events.forEach((event) => {
            const date = new Date(event.timestamp);
            const day = this.getDayOfWeek(date);
            const hour = date.getHours();
            const hourlyData = dayMap.get(day)!.get(hour)!;

            if (event.eventType === 'open') {
                hourlyData.opens++;
            } else if (event.eventType === 'click') {
                hourlyData.clicks++;
            }
        });

        return DAYS_OF_WEEK.map((dayOfWeek) => {
            const hourlyMap = dayMap.get(dayOfWeek)!;
            const hourlyData: HourlyEngagementData[] = [];

            let totalOpens = 0;
            let totalClicks = 0;
            let totalEvents = 0;

            for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
                const data = hourlyMap.get(hour)!;
                const eventCount = data.opens + data.clicks;
                const openRate = eventCount > 0 ? (data.opens / eventCount) * 100 : 0;
                const clickRate = eventCount > 0 ? (data.clicks / eventCount) * 100 : 0;

                hourlyData.push({
                    hour,
                    openCount: data.opens,
                    clickCount: data.clicks,
                    totalEvents: eventCount,
                    openRate: parseFloat(openRate.toFixed(2)),
                    clickRate: parseFloat(clickRate.toFixed(2)),
                });

                totalOpens += data.opens;
                totalClicks += data.clicks;
                totalEvents += eventCount;
            }

            const averageOpenRate = totalEvents > 0 ? (totalOpens / totalEvents) * 100 : 0;
            const averageClickRate = totalEvents > 0 ? (totalClicks / totalEvents) * 100 : 0;

            return {
                dayOfWeek,
                hourlyData,
                totalOpens,
                totalClicks,
                totalEvents,
                averageOpenRate: parseFloat(averageOpenRate.toFixed(2)),
                averageClickRate: parseFloat(averageClickRate.toFixed(2)),
            };
        });
    }

    private calculateOptimalWindows(dayData: DayOfWeekEngagementData[]): OptimalSendWindow[] {
        const windows: OptimalSendWindow[] = [];

        dayData.forEach((day) => {
            if (day.totalEvents < 3) {
                return;
            }

            for (let hour = 8; hour <= 19; hour++) {
                const hourly = day.hourlyData[hour];
                if (hourly.totalEvents < 2) {
                    continue;
                }

                const window: OptimalSendWindow = {
                    dayOfWeek: day.dayOfWeek,
                    startHour: hour,
                    endHour: hour + 1,
                    openRate: hourly.openRate,
                    clickRate: hourly.clickRate,
                    confidenceScore: this.calculateConfidenceScore(hourly.totalEvents),
                    sampleSize: hourly.totalEvents,
                };

                windows.push(window);
            }
        });

        windows.sort((a, b) => {
            const scoreA = a.openRate * 0.7 + a.clickRate * 0.3;
            const scoreB = b.openRate * 0.7 + b.clickRate * 0.3;
            return scoreB - scoreA;
        });

        return windows;
    }

    private calculateConfidenceScore(sampleSize: number): number {
        if (sampleSize < 5) {
            return 30;
        } else if (sampleSize < 20) {
            return 60;
        } else if (sampleSize < 50) {
            return 80;
        } else {
            return 95;
        }
    }

    detectRecipientTimezone(recipientId: string, email: string): string {
        const domain = email.split('@')[1];
        let detectedTimezone = 'UTC';

        if (domain.includes('.id')) {
            detectedTimezone = 'Asia/Jakarta';
        } else if (domain.includes('.sg') || domain.includes('.my')) {
            detectedTimezone = 'Asia/Singapore';
        } else if (domain.includes('.jp')) {
            detectedTimezone = 'Asia/Tokyo';
        } else if (domain.includes('.uk') || domain.includes('.co.uk')) {
            detectedTimezone = 'Europe/London';
        } else if (domain.includes('.us') || domain.includes('.com')) {
            detectedTimezone = 'America/New_York';
        }

        this.timezoneData.set(recipientId, {
            recipientId,
            timezone: detectedTimezone,
            autoDetected: true,
            lastDetected: new Date().toISOString(),
        });

        this.saveTimezoneData();

        return detectedTimezone;
    }

    setTimezonePreference(recipientId: string, timezone: string): void {
        this.timezoneData.set(recipientId, {
            recipientId,
            timezone,
            autoDetected: false,
            lastDetected: new Date().toISOString(),
        });

        this.saveTimezoneData();
    }

    getOptimalWindows(campaignId?: string): OptimalSendWindow[] {
        const insights = this.getSendTimeInsights(undefined, campaignId);
        return insights.optimalWindows.slice(0, 10);
    }

    generateEngagementHeatmap(campaignId?: string): Map<DayOfWeek, HourlyEngagementData[]> {
        const insights = this.getSendTimeInsights(undefined, campaignId);
        const heatmap = new Map<DayOfWeek, HourlyEngagementData[]>();

        insights.dayOfWeekData.forEach((day) => {
            heatmap.set(day.dayOfWeek, day.hourlyData);
        });

        return heatmap;
    }

    clearEngagementData(recipientId?: string): void {
        if (recipientId) {
            this.engagementEvents = this.engagementEvents.filter((e) => e.recipientId !== recipientId);
            this.recipientPatterns.delete(recipientId);
        } else {
            this.engagementEvents = [];
            this.recipientPatterns.clear();
        }

        this.saveEngagementEvents();
        this.saveRecipientPatterns();
    }

    reset(): void {
        this.engagementEvents = [];
        this.recipientPatterns.clear();
        this.timezoneData.clear();

        localStorage.removeItem(STORAGE_KEYS.ENGAGEMENT_EVENTS);
        localStorage.removeItem(STORAGE_KEYS.RECIPIENT_PATTERNS);
        localStorage.removeItem(STORAGE_KEYS.TIMEZONE_DATA);
    }
}

const emailSchedulerInstance = new EmailScheduler();

export { EmailScheduler };
export default emailSchedulerInstance;
export type { IEmailScheduler } from '@/types/emailScheduler';
