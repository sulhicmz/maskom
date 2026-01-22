import { EmailScheduler } from '../emailScheduler';
import type {
    EngagementEvent,
    DayOfWeek,
} from '@/types/emailScheduler';

describe('EmailScheduler', () => {
    let scheduler: EmailScheduler;

    beforeEach(() => {
        scheduler = new EmailScheduler();
        scheduler.reset();
        localStorage.clear();
    });

    afterEach(() => {
        scheduler.reset();
    });

    describe('trackEngagementEvent', () => {
        it('should track open event and save to storage', () => {
            const event: EngagementEvent = {
                id: 'evt-1',
                campaignId: 'campaign-1',
                recipientId: 'recipient-1',
                eventType: 'open',
                timestamp: new Date().toISOString(),
                timezone: 'UTC',
            };

            scheduler.trackEngagementEvent(event);

            const pattern = scheduler.getEngagementPattern('recipient-1');
            expect(pattern).not.toBeNull();
            expect(pattern?.recipientId).toBe('recipient-1');
            expect(pattern?.engagementEvents).toHaveLength(1);
        });

        it('should track click event and save to storage', () => {
            const event: EngagementEvent = {
                id: 'evt-2',
                campaignId: 'campaign-1',
                recipientId: 'recipient-1',
                eventType: 'click',
                timestamp: new Date().toISOString(),
                timezone: 'UTC',
            };

            scheduler.trackEngagementEvent(event);

            const pattern = scheduler.getEngagementPattern('recipient-1');
            expect(pattern).not.toBeNull();
            expect(pattern?.engagementEvents).toHaveLength(1);
        });

        it('should track multiple events for the same recipient', () => {
            const baseTime = new Date('2026-01-22T10:00:00.000Z');

            for (let i = 0; i < 5; i++) {
                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: 'campaign-1',
                    recipientId: 'recipient-1',
                    eventType: i % 2 === 0 ? 'open' : 'click',
                    timestamp: new Date(baseTime.getTime() + i * 3600000).toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const pattern = scheduler.getEngagementPattern('recipient-1');
            expect(pattern?.engagementEvents).toHaveLength(5);
        });

        it('should update recipient pattern with optimal day and hour', () => {
            const baseTime = new Date('2026-01-22T10:00:00.000Z');

            for (let i = 0; i < 10; i++) {
                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: 'campaign-1',
                    recipientId: 'recipient-1',
                    eventType: 'open',
                    timestamp: new Date(baseTime.getTime() + i * 3600000).toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const pattern = scheduler.getEngagementPattern('recipient-1');
            expect(pattern?.optimalDay).not.toBeNull();
            expect(pattern?.optimalHour).not.toBeNull();
            expect(typeof pattern?.optimalHour).toBe('number');
        });
    });

    describe('getEngagementPattern', () => {
        it('should return null for recipient with no events', () => {
            const pattern = scheduler.getEngagementPattern('nonexistent');
            expect(pattern).toBeNull();
        });

        it('should return pattern for existing recipient', () => {
            const event: EngagementEvent = {
                id: 'evt-1',
                campaignId: 'campaign-1',
                recipientId: 'recipient-1',
                eventType: 'open',
                timestamp: new Date().toISOString(),
                timezone: 'UTC',
            };

            scheduler.trackEngagementEvent(event);

            const pattern = scheduler.getEngagementPattern('recipient-1');
            expect(pattern).not.toBeNull();
            expect(pattern?.recipientId).toBe('recipient-1');
            expect(pattern?.engagementEvents).toHaveLength(1);
        });

        it('should include timezone in pattern', () => {
            const event: EngagementEvent = {
                id: 'evt-1',
                campaignId: 'campaign-1',
                recipientId: 'recipient-1',
                eventType: 'open',
                timestamp: new Date().toISOString(),
                timezone: 'Asia/Jakarta',
            };

            scheduler.trackEngagementEvent(event);

            const pattern = scheduler.getEngagementPattern('recipient-1');
            expect(pattern?.timezone).toBe('Asia/Jakarta');
        });

        it('should include lastUpdated timestamp', () => {
            const event: EngagementEvent = {
                id: 'evt-1',
                campaignId: 'campaign-1',
                recipientId: 'recipient-1',
                eventType: 'open',
                timestamp: new Date().toISOString(),
                timezone: 'UTC',
            };

            scheduler.trackEngagementEvent(event);

            const pattern = scheduler.getEngagementPattern('recipient-1');
            expect(pattern?.lastUpdated).toBeDefined();
            expect(new Date(pattern?.lastUpdated || '')).toBeInstanceOf(Date);
        });
    });

    describe('calculateOptimalSendTime', () => {
        it('should return fallback recommendation when no data available', () => {
            const recommendation = scheduler.calculateOptimalSendTime();

            expect(recommendation).toBeDefined();
            expect(recommendation.reason).toContain('benchmark industri');
            expect(recommendation.confidenceScore).toBe(50);
        });

        it('should return recommendation with high confidence when sufficient data', () => {
            const baseTime = new Date('2026-01-21T10:00:00.000Z');

            for (let i = 0; i < 30; i++) {
                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: 'campaign-1',
                    recipientId: 'recipient-1',
                    eventType: 'open',
                    timestamp: new Date(baseTime.getTime() + i * 86400000).toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const recommendation = scheduler.calculateOptimalSendTime('recipient-1');

            expect(recommendation.confidenceScore).toBeGreaterThan(60);
            expect(recommendation.recommendedSendTime).toBeDefined();
            expect(recommendation.expectedOpenRate).toBeGreaterThanOrEqual(0);
            expect(recommendation.expectedClickRate).toBeGreaterThanOrEqual(0);
        });

        it('should include alternative send time options', () => {
            const baseTime = new Date('2026-01-21T10:00:00.000Z');

            for (let i = 0; i < 20; i++) {
                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: 'campaign-1',
                    recipientId: 'recipient-1',
                    eventType: i % 2 === 0 ? 'open' : 'click',
                    timestamp: new Date(baseTime.getTime() + i * 3600000).toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const recommendation = scheduler.calculateOptimalSendTime('recipient-1');

            expect(recommendation.alternativeOptions).toBeDefined();
            expect(Array.isArray(recommendation.alternativeOptions)).toBe(true);
            expect(recommendation.alternativeOptions.length).toBeGreaterThan(0);
            expect(recommendation.alternativeOptions.length).toBeLessThanOrEqual(3);
        });

        it('should calculate next occurrence correctly', () => {
            const baseTime = new Date('2026-01-21T10:00:00.000Z');

            for (let i = 0; i < 15; i++) {
                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: 'campaign-1',
                    recipientId: 'recipient-1',
                    eventType: 'open',
                    timestamp: new Date(baseTime.getTime() + i * 86400000).toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const recommendation = scheduler.calculateOptimalSendTime('recipient-1');
            const recommendedDate = new Date(recommendation.recommendedSendTime);

            expect(recommendedDate).toBeInstanceOf(Date);
            expect(recommendedDate.getTime()).toBeGreaterThan(Date.now());
        });
    });

    describe('detectRecipientTimezone', () => {
        it('should detect Indonesian timezone for .id domain', () => {
            const timezone = scheduler.detectRecipientTimezone('user-1', 'test@example.id');
            expect(timezone).toBe('Asia/Jakarta');
        });

        it('should detect Singapore timezone for .sg domain', () => {
            const timezone = scheduler.detectRecipientTimezone('user-1', 'test@example.sg');
            expect(timezone).toBe('Asia/Singapore');
        });

        it('should detect Malaysia timezone for .my domain', () => {
            const timezone = scheduler.detectRecipientTimezone('user-1', 'test@example.my');
            expect(timezone).toBe('Asia/Singapore');
        });

        it('should detect Japanese timezone for .jp domain', () => {
            const timezone = scheduler.detectRecipientTimezone('user-1', 'test@example.jp');
            expect(timezone).toBe('Asia/Tokyo');
        });

        it('should detect UK timezone for .uk domain', () => {
            const timezone = scheduler.detectRecipientTimezone('user-1', 'test@example.co.uk');
            expect(timezone).toBe('Europe/London');
        });

        it('should detect US timezone for .com domain', () => {
            const timezone = scheduler.detectRecipientTimezone('user-1', 'test@example.com');
            expect(timezone).toBe('America/New_York');
        });

        it('should default to UTC for unknown domain', () => {
            const timezone = scheduler.detectRecipientTimezone('user-1', 'test@example.unknown');
            expect(timezone).toBe('UTC');
        });

        it('should save timezone data', () => {
            scheduler.detectRecipientTimezone('user-1', 'test@example.id');

            const recommendation = scheduler.calculateOptimalSendTime('user-1');
            expect(recommendation.timezone).toBe('Asia/Jakarta');
        });
    });

    describe('setTimezonePreference', () => {
        it('should set manual timezone preference', () => {
            scheduler.setTimezonePreference('user-1', 'Asia/Jakarta');

            const recommendation = scheduler.calculateOptimalSendTime('user-1');
            expect(recommendation.timezone).toBe('Asia/Jakarta');
        });

        it('should override auto-detected timezone', () => {
            scheduler.detectRecipientTimezone('user-1', 'test@example.com');
            expect(scheduler.calculateOptimalSendTime('user-1').timezone).toBe('America/New_York');

            scheduler.setTimezonePreference('user-1', 'Asia/Jakarta');
            expect(scheduler.calculateOptimalSendTime('user-1').timezone).toBe('Asia/Jakarta');
        });
    });

    describe('getSendTimeInsights', () => {
        it('should return empty insights when no data', () => {
            const insights = scheduler.getSendTimeInsights();

            expect(insights.dayOfWeekData).toHaveLength(7);
            expect(insights.optimalWindows).toHaveLength(0);
            expect(insights.overallBestWindow).toBeNull();
        });

        it('should include day of week data with hourly breakdown', () => {
            const insights = scheduler.getSendTimeInsights();

            insights.dayOfWeekData.forEach((dayData) => {
                expect(dayData.hourlyData).toHaveLength(24);
                expect(dayData.hourlyData[0].hour).toBe(0);
                expect(dayData.hourlyData[23].hour).toBe(23);
            });
        });

        it('should calculate optimal windows from engagement data', () => {
            const baseTime = new Date('2026-01-21T10:00:00.000Z');

            for (let i = 0; i < 20; i++) {
                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: 'campaign-1',
                    recipientId: 'recipient-1',
                    eventType: 'open',
                    timestamp: new Date(baseTime.getTime() + i * 3600000).toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const insights = scheduler.getSendTimeInsights('recipient-1');

            expect(insights.optimalWindows.length).toBeGreaterThan(0);
            expect(insights.overallBestWindow).not.toBeNull();
        });

        it('should include industry fallback in insights', () => {
            const insights = scheduler.getSendTimeInsights();

            expect(insights.industryFallback).toBeDefined();
            expect(insights.industryFallback.dayOfWeek).toBe('Tuesday');
            expect(insights.industryFallback.startHour).toBe(9);
            expect(insights.industryFallback.endHour).toBe(11);
        });

        it('should filter by campaignId when provided', () => {
            const baseTime = new Date('2026-01-21T10:00:00.000Z');

            for (let i = 0; i < 10; i++) {
                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: i < 5 ? 'campaign-1' : 'campaign-2',
                    recipientId: 'recipient-1',
                    eventType: 'open',
                    timestamp: new Date(baseTime.getTime() + i * 3600000).toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const insights1 = scheduler.getSendTimeInsights(undefined, 'campaign-1');
            const insights2 = scheduler.getSendTimeInsights(undefined, 'campaign-2');

            expect(insights1.dayOfWeekData[0].totalOpens).toBe(5);
            expect(insights2.dayOfWeekData[0].totalOpens).toBe(5);
        });

        it('should filter by recipientId when provided', () => {
            const baseTime = new Date('2026-01-21T10:00:00.000Z');

            for (let i = 0; i < 10; i++) {
                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: 'campaign-1',
                    recipientId: i < 5 ? 'recipient-1' : 'recipient-2',
                    eventType: 'open',
                    timestamp: new Date(baseTime.getTime() + i * 3600000).toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const insights1 = scheduler.getSendTimeInsights('recipient-1');
            const insights2 = scheduler.getSendTimeInsights('recipient-2');

            expect(insights1.dayOfWeekData[0].totalOpens).toBe(5);
            expect(insights2.dayOfWeekData[0].totalOpens).toBe(5);
        });
    });

    describe('getOptimalWindows', () => {
        it('should return empty array when no data', () => {
            const windows = scheduler.getOptimalWindows();
            expect(windows).toHaveLength(0);
        });

        it('should return optimal windows sorted by score', () => {
            const baseTime = new Date('2026-01-21T10:00:00.000Z');

            for (let i = 0; i < 30; i++) {
                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: 'campaign-1',
                    recipientId: 'recipient-1',
                    eventType: i % 2 === 0 ? 'open' : 'click',
                    timestamp: new Date(baseTime.getTime() + i * 3600000).toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const windows = scheduler.getOptimalWindows();

            expect(windows.length).toBeGreaterThan(0);
            expect(windows.length).toBeLessThanOrEqual(10);

            for (let i = 1; i < windows.length; i++) {
                const scoreA = windows[i - 1].openRate * 0.7 + windows[i - 1].clickRate * 0.3;
                const scoreB = windows[i].openRate * 0.7 + windows[i].clickRate * 0.3;
                expect(scoreA).toBeGreaterThanOrEqual(scoreB);
            }
        });

        xit('should filter by campaignId when provided', () => {
            const baseTime = new Date('2026-01-21T09:00:00.000Z');

            for (let i = 0; i < 84; i++) {
                const dayOffset = Math.floor(i / 12);
                const eventTime = new Date(baseTime.getTime() + dayOffset * 86400000 + (i % 12) * 3600000);

                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: i < 42 ? 'campaign-1' : 'campaign-2',
                    recipientId: 'recipient-1',
                    eventType: 'open',
                    timestamp: eventTime.toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const windows1 = scheduler.getOptimalWindows('campaign-1');
            const windows2 = scheduler.getOptimalWindows('campaign-2');

            expect(windows1.length).toBeGreaterThan(0);
            expect(windows2.length).toBeGreaterThan(0);
        });
    });

    describe('generateEngagementHeatmap', () => {
        it('should return empty heatmap when no data', () => {
            const heatmap = scheduler.generateEngagementHeatmap();

            expect(heatmap.size).toBe(7);
            heatmap.forEach((hourlyData) => {
                expect(hourlyData).toHaveLength(24);
                expect(hourlyData.every((h) => h.totalEvents === 0)).toBe(true);
            });
        });

        it('should populate heatmap with engagement data', () => {
            const baseTime = new Date('2026-01-21T10:00:00.000Z');

            for (let i = 0; i < 20; i++) {
                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: 'campaign-1',
                    recipientId: 'recipient-1',
                    eventType: 'open',
                    timestamp: new Date(baseTime.getTime() + i * 3600000).toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const heatmap = scheduler.generateEngagementHeatmap();

            let hasData = false;
            heatmap.forEach((hourlyData) => {
                hourlyData.forEach((hour) => {
                    if (hour.totalEvents > 0) {
                        hasData = true;
                    }
                });
            });

            expect(hasData).toBe(true);
        });

        it('should include all 7 days of week', () => {
            const heatmap = scheduler.generateEngagementHeatmap();

            const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

            days.forEach((day) => {
                expect(heatmap.has(day)).toBe(true);
                expect(heatmap.get(day)?.length).toBe(24);
            });
        });
    });

    describe('clearEngagementData', () => {
        it('should clear all data when no recipientId provided', () => {
            const event: EngagementEvent = {
                id: 'evt-1',
                campaignId: 'campaign-1',
                recipientId: 'recipient-1',
                eventType: 'open',
                timestamp: new Date().toISOString(),
                timezone: 'UTC',
            };

            scheduler.trackEngagementEvent(event);
            expect(scheduler.getEngagementPattern('recipient-1')).not.toBeNull();

            scheduler.clearEngagementData();
            expect(scheduler.getEngagementPattern('recipient-1')).toBeNull();
        });

        it('should clear data for specific recipient', () => {
            const event1: EngagementEvent = {
                id: 'evt-1',
                campaignId: 'campaign-1',
                recipientId: 'recipient-1',
                eventType: 'open',
                timestamp: new Date().toISOString(),
                timezone: 'UTC',
            };

            const event2: EngagementEvent = {
                id: 'evt-2',
                campaignId: 'campaign-1',
                recipientId: 'recipient-2',
                eventType: 'open',
                timestamp: new Date().toISOString(),
                timezone: 'UTC',
            };

            scheduler.trackEngagementEvent(event1);
            scheduler.trackEngagementEvent(event2);

            expect(scheduler.getEngagementPattern('recipient-1')).not.toBeNull();
            expect(scheduler.getEngagementPattern('recipient-2')).not.toBeNull();

            scheduler.clearEngagementData('recipient-1');

            expect(scheduler.getEngagementPattern('recipient-1')).toBeNull();
            expect(scheduler.getEngagementPattern('recipient-2')).not.toBeNull();
        });
    });

    describe('reset', () => {
        it('should clear all data and storage', () => {
            const event: EngagementEvent = {
                id: 'evt-1',
                campaignId: 'campaign-1',
                recipientId: 'recipient-1',
                eventType: 'open',
                timestamp: new Date().toISOString(),
                timezone: 'UTC',
            };

            scheduler.trackEngagementEvent(event);
            scheduler.detectRecipientTimezone('recipient-1', 'test@example.id');

            expect(scheduler.getEngagementPattern('recipient-1')).not.toBeNull();
            expect(scheduler.calculateOptimalSendTime('recipient-1').timezone).toBe('Asia/Jakarta');

            scheduler.reset();

            expect(scheduler.getEngagementPattern('recipient-1')).toBeNull();
            expect(scheduler.calculateOptimalSendTime('recipient-1').timezone).toBe('UTC');
        });
    });

    xdescribe('Confidence Score Calculation', () => {
        xit('should return low confidence for small sample sizes', () => {
            const baseTime = new Date('2026-01-21T09:00:00.000Z');

            for (let i = 0; i < 6; i++) {
                const dayOffset = Math.floor(i / 2);
                const eventTime = new Date(baseTime.getTime() + dayOffset * 86400000 + (i % 2) * 3600000);

                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: 'campaign-1',
                    recipientId: 'recipient-1',
                    eventType: 'open',
                    timestamp: eventTime.toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const recommendation = scheduler.calculateOptimalSendTime('recipient-1');
            expect(recommendation.confidenceScore).toBe(30);
        });

        xit('should return high confidence for large sample sizes', () => {
            const baseTime = new Date('2026-01-21T09:00:00.000Z');

            for (let i = 0; i < 140; i++) {
                const dayOffset = Math.floor(i / 20);
                const eventTime = new Date(baseTime.getTime() + dayOffset * 86400000 + (i % 20) * 3600000);

                const event: EngagementEvent = {
                    id: `evt-${i}`,
                    campaignId: 'campaign-1',
                    recipientId: 'recipient-1',
                    eventType: 'open',
                    timestamp: eventTime.toISOString(),
                    timezone: 'UTC',
                };

                scheduler.trackEngagementEvent(event);
            }

            const recommendation = scheduler.calculateOptimalSendTime('recipient-1');
            expect(recommendation.confidenceScore).toBe(95);
        });
    });
});
