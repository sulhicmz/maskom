import campaignManager from '../campaignManager';
import emailService from '@/services/email/EmailService';

jest.mock('@/services/email/EmailService');

describe('CampaignManager', () => {
    const createMockLocalStorage = (): Storage => {
        const storage: Record<string, string> = {};
        return {
            clear() {
                Object.keys(storage).forEach(key => delete storage[key]);
            },
            getItem(key: string) {
                return storage[key] || null;
            },
            setItem(key: string, value: string) {
                storage[key] = String(value);
            },
            removeItem(key: string) {
                delete storage[key];
            },
            get length() {
                return Object.keys(storage).length;
            },
            key(index: number) {
                return Object.keys(storage)[index] || null;
            },
        } as unknown as Storage;
    };

    beforeEach(() => {
        const mockLocalStorage = createMockLocalStorage();
        (global as any).localStorage = mockLocalStorage;
        global.localStorage = mockLocalStorage;
        global.window = { localStorage: mockLocalStorage } as any;
        jest.clearAllMocks();
        jest.useFakeTimers();

        (emailService.sendTemplatedEmail as jest.Mock).mockResolvedValue({
            success: true,
            data: { messageId: 'msg-123' },
        });
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    describe('getAllCampaigns', () => {
        it('should return all campaigns sorted by creation date', () => {
            const campaigns = campaignManager.getAllCampaigns();

            expect(campaigns).toHaveLength(5);
            expect(campaigns[0].id).toBe('CAMP-001');
            expect(campaigns[campaigns.length - 1].id).toBe('CAMP-005');
        });

        it('should return new campaigns first', () => {
            const campaigns = campaignManager.getAllCampaigns();

            const firstCreated = new Date(campaigns[0].createdAt).getTime();
            const lastCreated = new Date(campaigns[campaigns.length - 1].createdAt).getTime();

            expect(firstCreated).toBeGreaterThan(lastCreated);
        });
    });

    describe('getCampaignById', () => {
        it('should return campaign by ID', () => {
            const campaign = campaignManager.getCampaignById('CAMP-001');

            expect(campaign).toBeDefined();
            expect(campaign?.id).toBe('CAMP-001');
            expect(campaign?.name).toBe('Welcome Newsletter - New Subscribers');
        });

        it('should return undefined for non-existent ID', () => {
            const campaign = campaignManager.getCampaignById('NON-EXISTENT');

            expect(campaign).toBeUndefined();
        });
    });

    describe('filterCampaigns', () => {
        it('should filter by status', () => {
            const filter = { status: 'draft' as const };
            const campaigns = campaignManager.filterCampaigns(filter);

            expect(campaigns).toHaveLength(1);
            expect(campaigns[0].id).toBe('CAMP-001');
        });

        it('should filter by templateId', () => {
            const filter = { templateId: 1 };
            const campaigns = campaignManager.filterCampaigns(filter);

            expect(campaigns).toHaveLength(1);
            expect(campaigns[0].id).toBe('CAMP-001');
        });

        it('should filter by search query', () => {
            const filter = { searchQuery: 'Analytics' };
            const campaigns = campaignManager.filterCampaigns(filter);

            expect(campaigns).toHaveLength(1);
            expect(campaigns[0].id).toBe('CAMP-003');
        });

        it('should filter by subject in search query', () => {
            const filter = { searchQuery: 'January' };
            const campaigns = campaignManager.filterCampaigns(filter);

            expect(campaigns).toHaveLength(1);
            expect(campaigns[0].id).toBe('CAMP-004');
        });

        it('should filter by date range', () => {
            const filter = {
                dateRange: {
                    from: '2026-01-17T00:00:00.000Z',
                    to: '2026-01-19T23:59:59.999Z',
                },
            };
            const campaigns = campaignManager.filterCampaigns(filter);

            expect(campaigns).toHaveLength(2);
            expect(campaigns.map(c => c.id)).toContain('CAMP-001');
            expect(campaigns.map(c => c.id)).toContain('CAMP-003');
        });

        it('should return all campaigns when no filter applied', () => {
            const campaigns = campaignManager.filterCampaigns({});

            expect(campaigns).toHaveLength(5);
        });

        it('should return empty array when no campaigns match filter', () => {
            const filter = { status: 'sending' as const };
            const campaigns = campaignManager.filterCampaigns(filter);

            expect(campaigns).toHaveLength(0);
        });
    });

    describe('createCampaign', () => {
        it('should create new campaign with required fields', () => {
            const newCampaign = campaignManager.createCampaign({
                name: 'Test Campaign',
                templateId: 1,
                recipientLists: [
                    {
                        id: 'LIST-NEW',
                        name: 'Test List',
                        segments: [],
                        totalRecipients: 0,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
                status: 'draft',
                variableValues: {},
            });

            expect(newCampaign).toBeDefined();
            expect(newCampaign.id).toMatch(/^CAMP-\d+$/);
            expect(newCampaign.name).toBe('Test Campaign');
            expect(newCampaign.sentCount).toBe(0);
            expect(newCampaign.openCount).toBe(0);
            expect(newCampaign.clickCount).toBe(0);
            expect(newCampaign.bounceCount).toBe(0);
        });

        it('should set createdAt timestamp', () => {
            const beforeCreate = Date.now();
            const newCampaign = campaignManager.createCampaign({
                name: 'Test',
                templateId: 1,
                recipientLists: [],
                status: 'draft',
            });

            const createdAt = new Date(newCampaign.createdAt).getTime();
            expect(createdAt).toBeGreaterThanOrEqual(beforeCreate);
        });

        it('should save campaign to localStorage', () => {
            const campaignsBefore = campaignManager.getAllCampaigns();

            campaignManager.createCampaign({
                name: 'New Campaign',
                templateId: 1,
                recipientLists: [],
                status: 'draft',
            });

            const campaignsAfter = campaignManager.getAllCampaigns();
            expect(campaignsAfter.length).toBe(campaignsBefore.length + 1);
        });
    });

    describe('updateCampaign', () => {
        it('should update existing campaign', () => {
            const updated = campaignManager.updateCampaign('CAMP-001', {
                name: 'Updated Name',
            });

            expect(updated).not.toBeNull();
            expect(updated?.name).toBe('Updated Name');
        });

        it('should preserve immutable fields on update', () => {
            const original = campaignManager.getCampaignById('CAMP-001');
            const updated = campaignManager.updateCampaign('CAMP-001', {
                name: 'Updated',
            });

            expect(updated?.id).toBe(original?.id);
            expect(updated?.createdAt).toBe(original?.createdAt);
        });

        it('should return null for non-existent campaign', () => {
            const updated = campaignManager.updateCampaign('NON-EXISTENT', {
                name: 'Updated',
            });

            expect(updated).toBeNull();
        });

        it('should not allow updating sent campaign', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const updated = campaignManager.updateCampaign('CAMP-004', {
                name: 'Should not update',
            });

            expect(updated).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith('Cannot modify a sent campaign');
            consoleSpy.mockRestore();
        });

        it('should save changes to localStorage', () => {
            campaignManager.updateCampaign('CAMP-001', { name: 'Updated' });

            const campaign = campaignManager.getCampaignById('CAMP-001');
            expect(campaign?.name).toBe('Updated');
        });
    });

    describe('deleteCampaign', () => {
        it('should delete existing campaign', () => {
            const campaignsBefore = campaignManager.getAllCampaigns();
            const result = campaignManager.deleteCampaign('CAMP-001');

            expect(result).toBe(true);
            const campaignsAfter = campaignManager.getAllCampaigns();
            expect(campaignsAfter.length).toBe(campaignsBefore.length - 1);
        });

        it('should return false for non-existent campaign', () => {
            const result = campaignManager.deleteCampaign('NON-EXISTENT');

            expect(result).toBe(false);
        });

        it('should not allow deleting sending campaign', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            const campaignsBefore = campaignManager.getAllCampaigns();

            const result = campaignManager.deleteCampaign('CAMP-002');

            expect(result).toBe(false);
            expect(campaignsBefore.length).toBe(campaignManager.getAllCampaigns().length);
            expect(consoleSpy).toHaveBeenCalledWith('Cannot delete a campaign that is currently sending');
            consoleSpy.mockRestore();
        });

        it('should save changes to localStorage', () => {
            campaignManager.deleteCampaign('CAMP-005');

            const campaign = campaignManager.getCampaignById('CAMP-005');
            expect(campaign).toBeUndefined();
        });
    });

    describe('duplicateCampaign', () => {
        it('should duplicate existing campaign', () => {
            const duplicate = campaignManager.duplicateCampaign('CAMP-001');

            expect(duplicate).not.toBeNull();
            expect(duplicate?.name).toBe('Welcome Newsletter - New Subscribers (Copy)');
            expect(duplicate?.status).toBe('draft');
            expect(duplicate?.id).not.toBe('CAMP-001');
        });

        it('should copy all fields except id and status', () => {
            const original = campaignManager.getCampaignById('CAMP-004');
            const duplicate = campaignManager.duplicateCampaign('CAMP-004');

            expect(duplicate?.name).toContain('(Copy)');
            expect(duplicate?.templateId).toBe(original?.templateId);
            expect(duplicate?.recipientLists).toEqual(original?.recipientLists);
            expect(duplicate?.variableValues).toEqual(original?.variableValues);
        });

        it('should return null for non-existent campaign', () => {
            const duplicate = campaignManager.duplicateCampaign('NON-EXISTENT');

            expect(duplicate).toBeNull();
        });
    });

    describe('getCampaignMetrics', () => {
        it('should calculate metrics for sent campaign', () => {
            const metrics = campaignManager.getCampaignMetrics('CAMP-004');

            expect(metrics).not.toBeNull();
            expect(metrics?.sentCount).toBe(350);
            expect(metrics?.openCount).toBe(280);
            expect(metrics?.clickCount).toBe(140);
            expect(metrics?.bounceCount).toBe(5);
        });

        it('should calculate rates correctly', () => {
            const metrics = campaignManager.getCampaignMetrics('CAMP-004');

            expect(metrics?.openRate).toBeCloseTo(80.0, 1);
            expect(metrics?.clickRate).toBeCloseTo(50.0, 1);
            expect(metrics?.bounceRate).toBeCloseTo(1.43, 1);
        });

        it('should handle zero sent count', () => {
            const metrics = campaignManager.getCampaignMetrics('CAMP-001');

            expect(metrics?.openRate).toBe(0);
            expect(metrics?.clickRate).toBe(0);
            expect(metrics?.bounceRate).toBe(0);
        });

        it('should return null for non-existent campaign', () => {
            const metrics = campaignManager.getCampaignMetrics('NON-EXISTENT');

            expect(metrics).toBeNull();
        });
    });

    describe('scheduleCampaign', () => {
        it('should schedule campaign for future date', () => {
            const futureDate = new Date(Date.now() + 86400000).toISOString();
            const result = campaignManager.scheduleCampaign('CAMP-001', futureDate);

            expect(result.success).toBe(true);
            expect(result.message).toBe('Campaign scheduled successfully');
            expect(result.campaignId).toBe('CAMP-001');

            const campaign = campaignManager.getCampaignById('CAMP-001');
            expect(campaign?.scheduledFor).toBe(futureDate);
            expect(campaign?.status).toBe('scheduled');
        });

        it('should return error for non-existent campaign', () => {
            const result = campaignManager.scheduleCampaign('NON-EXISTENT', '2026-01-20');

            expect(result.success).toBe(false);
            expect(result.message).toContain('not found');
        });

        it('should not allow scheduling sent campaign', () => {
            const result = campaignManager.scheduleCampaign('CAMP-004', '2026-01-20');

            expect(result.success).toBe(false);
            expect(result.message).toContain('already been sent or is currently sending');
        });

        it('should not allow scheduling past date', () => {
            const pastDate = new Date(Date.now() - 86400000).toISOString();
            const result = campaignManager.scheduleCampaign('CAMP-001', pastDate);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Scheduled date must be in future');
        });

        it('should return error for update failure', () => {
            const result = campaignManager.scheduleCampaign('CAMP-004', '2026-01-20');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Cannot schedule a campaign that has been sent or is currently sending');
        });
    });

    describe('sendCampaign', () => {
        it('should send campaign with recipients', () => {
            const result = campaignManager.sendCampaign('CAMP-001');

            expect(result.success).toBe(true);
            expect(result.message).toBe('Campaign queued for sending');

            const campaign = campaignManager.getCampaignById('CAMP-001');
            expect(campaign?.status).toBe('sending');
        });

        it('should return error for non-existent campaign', () => {
            const result = campaignManager.sendCampaign('NON-EXISTENT');

            expect(result.success).toBe(false);
            expect(result.message).toContain('not found');
        });

        it('should not allow sending already sent campaign', () => {
            const result = campaignManager.sendCampaign('CAMP-004');

            expect(result.success).toBe(false);
            expect(result.message).toContain('already been sent or is currently sending');
        });

        it('should return error for campaign with no recipients', () => {
            const emptyListCampaignId = campaignManager.createCampaign({
                name: 'Empty List',
                templateId: 1,
                recipientLists: [
                    {
                        id: 'EMPTY',
                        name: 'Empty',
                        segments: [],
                        totalRecipients: 0,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
                status: 'draft',
            });

            const result = campaignManager.sendCampaign(emptyListCampaignId);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Campaign has no recipients');
        });

        it('should reset metrics on send', () => {
            campaignManager.sendCampaign('CAMP-003');

            const campaign = campaignManager.getCampaignById('CAMP-003');
            expect(campaign?.sentCount).toBe(0);
            expect(campaign?.openCount).toBe(0);
            expect(campaign?.clickCount).toBe(0);
            expect(campaign?.bounceCount).toBe(0);
        });
    });

    describe('updateCampaignMetrics', () => {
        it('should update campaign metrics', () => {
            const campaignId = campaignManager.createCampaign({
                name: 'Metrics Test',
                templateId: 1,
                recipientLists: [
                    {
                        id: 'LIST',
                        name: 'List',
                        segments: [],
                        totalRecipients: 100,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
                status: 'draft',
            }).id;

            campaignManager.sendCampaign(campaignId);

            const result = campaignManager.updateCampaignMetrics(campaignId, {
                sentCount: 100,
                openCount: 50,
                clickCount: 20,
                bounceCount: 5,
            });

            expect(result).toBe(true);
            const campaign = campaignManager.getCampaignById(campaignId);
            expect(campaign?.sentCount).toBe(100);
            expect(campaign?.openCount).toBe(50);
            expect(campaign?.clickCount).toBe(20);
            expect(campaign?.bounceCount).toBe(5);
        });

        it('should return false for non-existent campaign', () => {
            const result = campaignManager.updateCampaignMetrics('NON-EXISTENT', {
                sentCount: 100,
            });

            expect(result).toBe(false);
        });
    });

    describe('cancelCampaign', () => {
        it('should cancel draft campaign', () => {
            const result = campaignManager.cancelCampaign('CAMP-001');

            expect(result).toBe(true);
            const campaign = campaignManager.getCampaignById('CAMP-001');
            expect(campaign?.status).toBe('cancelled');
        });

        it('should cancel scheduled campaign', () => {
            const result = campaignManager.cancelCampaign('CAMP-002');

            expect(result).toBe(true);
            const campaign = campaignManager.getCampaignById('CAMP-002');
            expect(campaign?.status).toBe('cancelled');
        });

        it('should not allow cancelling sent campaign', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            const campaignsBefore = campaignManager.getAllCampaigns();

            const result = campaignManager.cancelCampaign('CAMP-004');

            expect(result).toBe(false);
            expect(campaignsBefore.length).toBe(campaignManager.getAllCampaigns().length);
            expect(consoleSpy).toHaveBeenCalledWith('Cannot cancel a campaign that has already been sent');
            consoleSpy.mockRestore();
        });

        it('should return false for non-existent campaign', () => {
            const result = campaignManager.cancelCampaign('NON-EXISTENT');

            expect(result).toBe(false);
        });
    });

    describe('getCampaignStats', () => {
        it('should return campaign statistics', () => {
            const stats = campaignManager.getCampaignStats();

            expect(stats).toEqual({
                total: 5,
                draft: 1,
                scheduled: 2,
                sending: 0,
                sent: 1,
                cancelled: 1,
            });
        });

        it('should calculate counts correctly', () => {
            const stats = campaignManager.getCampaignStats();

            expect(stats.total).toBe(stats.draft + stats.scheduled + stats.sending + stats.sent + stats.cancelled);
        });
    });

    describe('trackEmailEvent', () => {
        it('should track open event', () => {
            const campaignId = campaignManager.createCampaign({
                name: 'Track Test',
                templateId: 1,
                recipientLists: [
                    {
                        id: 'LIST',
                        name: 'List',
                        segments: [],
                        totalRecipients: 100,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
                status: 'sent',
            }).id;

            campaignManager.updateCampaignMetrics(campaignId, { sentCount: 100, openCount: 10 });

            campaignManager.trackEmailEvent(campaignId, 'open');

            const campaign = campaignManager.getCampaignById(campaignId);
            expect(campaign?.openCount).toBe(11);
        });

        it('should track click event', () => {
            const campaignId = campaignManager.createCampaign({
                name: 'Track Test',
                templateId: 1,
                recipientLists: [
                    {
                        id: 'LIST',
                        name: 'List',
                        segments: [],
                        totalRecipients: 100,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
                status: 'sent',
            }).id;

            campaignManager.updateCampaignMetrics(campaignId, { sentCount: 100, clickCount: 5 });

            campaignManager.trackEmailEvent(campaignId, 'click');

            const campaign = campaignManager.getCampaignById(campaignId);
            expect(campaign?.clickCount).toBe(6);
        });

        it('should track bounce event', () => {
            const campaignId = campaignManager.createCampaign({
                name: 'Track Test',
                templateId: 1,
                recipientLists: [
                    {
                        id: 'LIST',
                        name: 'List',
                        segments: [],
                        totalRecipients: 100,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
                status: 'sent',
            }).id;

            campaignManager.updateCampaignMetrics(campaignId, { sentCount: 100, bounceCount: 2 });

            campaignManager.trackEmailEvent(campaignId, 'bounce');

            const campaign = campaignManager.getCampaignById(campaignId);
            expect(campaign?.bounceCount).toBe(3);
        });

        it('should not affect campaign for non-existent ID', () => {
            const campaignsBefore = campaignManager.getAllCampaigns();

            campaignManager.trackEmailEvent('NON-EXISTENT', 'open');

            const campaignsAfter = campaignManager.getAllCampaigns();
            expect(campaignsAfter.length).toBe(campaignsBefore.length);
        });
    });

    describe('executeBulkSend', () => {
        it('should send emails to all recipients', async () => {
            const campaignId = campaignManager.createCampaign({
                name: 'Bulk Send Test',
                templateId: 1,
                recipientLists: [
                    {
                        id: 'LIST',
                        name: 'List',
                        segments: [
                            {
                                id: 'SEG',
                                name: 'Segment',
                                criteria: {},
                                count: 2,
                            },
                        ],
                        totalRecipients: 2,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
                status: 'draft',
                variableValues: { testVar: 'value' },
            }).id;

            const result = await campaignManager.executeBulkSend(campaignId);

            expect(result.isComplete).toBe(true);
            expect(result.sentCount).toBe(2);
            expect(result.failedCount).toBe(0);

            expect(emailService.sendTemplatedEmail).toHaveBeenCalledTimes(2);
        });

        it('should handle send failures', async () => {
            (emailService.sendTemplatedEmail as jest.Mock).mockRejectedValue(
                new Error('Send failed')
            );
            const campaignId = campaignManager.createCampaign({
                name: 'Failure Test',
                templateId: 1,
                recipientLists: [
                    {
                        id: 'LIST',
                        name: 'List',
                        segments: [
                            {
                                id: 'SEG',
                                name: 'Segment',
                                criteria: {},
                                count: 2,
                            },
                        ],
                        totalRecipients: 2,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
                status: 'draft',
            }).id;

            const result = await campaignManager.executeBulkSend(campaignId);

            expect(result.isComplete).toBe(true);
            expect(result.failedCount).toBe(2);
        });

        it('should return progress for non-existent campaign', async () => {
            const result = await campaignManager.executeBulkSend('NON-EXISTENT');

            expect(result.isComplete).toBe(false);
            expect(result.totalRecipients).toBe(0);
            expect(result.sentCount).toBe(0);
            expect(result.failedCount).toBe(0);
        });

        it('should update campaign status to sent after completion', async () => {
            const campaignId = campaignManager.createCampaign({
                name: 'Status Test',
                templateId: 1,
                recipientLists: [
                    {
                        id: 'LIST',
                        name: 'List',
                        segments: [
                            {
                                id: 'SEG',
                                name: 'Segment',
                                criteria: {},
                                count: 1,
                            },
                        ],
                        totalRecipients: 1,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
                status: 'draft',
            }).id;

            await campaignManager.executeBulkSend(campaignId);

            const campaign = campaignManager.getCampaignById(campaignId);
            expect(campaign?.status).toBe('sent');
            expect(campaign?.sentAt).toBeDefined();
        });

        it('should update metrics during send', async () => {
            const campaignId = campaignManager.createCampaign({
                name: 'Metrics Test',
                templateId: 1,
                recipientLists: [
                    {
                        id: 'LIST',
                        name: 'List',
                        segments: [
                            {
                                id: 'SEG',
                                name: 'Segment',
                                criteria: {},
                                count: 1,
                            },
                        ],
                        totalRecipients: 1,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
                status: 'draft',
            }).id;

            await campaignManager.executeBulkSend(campaignId);
            jest.runAllTimers();

            const campaign = campaignManager.getCampaignById(campaignId);
            expect(campaign?.sentCount).toBe(1);
            expect(campaign?.openCount).toBe(0);
            expect(campaign?.clickCount).toBe(0);
            expect(campaign?.bounceCount).toBe(0);
        });
    });

    describe('processScheduledCampaigns', () => {
        it('should process campaigns scheduled for past/present time', async () => {
            const campaignsBefore = campaignManager.getAllCampaigns();
            const scheduledCount = campaignsBefore.filter(c => c.status === 'scheduled').length;

            const result = await campaignManager.processScheduledCampaigns();

            expect(result).toHaveLength(scheduledCount);
        });

        it('should skip campaigns scheduled for future', async () => {
            const result = await campaignManager.processScheduledCampaigns();

            for (const progress of result) {
                if (progress.totalRecipients > 0) {
                    expect(progress.campaignId).not.toContain('CAMP-002');
                    expect(progress.campaignId).not.toContain('CAMP-003');
                }
            }
        });

        it('should update status to sent after processing', async () => {
            await campaignManager.processScheduledCampaigns();

            const processedCampaigns = ['CAMP-002', 'CAMP-003'];
            for (const campaignId of processedCampaigns) {
                const campaign = campaignManager.getCampaignById(campaignId);
                if (campaign) {
                    expect(['sending', 'sent']).toContain(campaign.status);
                }
            }
        });
    });
});
