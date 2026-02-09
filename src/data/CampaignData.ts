import type { EmailCampaign } from '@/types/campaign';

export const campaign_data: EmailCampaign[] = [
    {
        id: 'CAMP-001',
        name: 'Welcome Newsletter - New Subscribers',
        templateId: 1,
        recipientLists: [
            {
                id: 'LIST-001',
                name: 'New Users (Last 30 Days)',
                segments: [
                    {
                        id: 'SEG-001',
                        name: 'New Users',
                        criteria: {
                            role: ['user'],
                        },
                        count: 150,
                    },
                ],
                totalRecipients: 150,
                createdAt: '2026-01-15T00:00:00.000Z',
                updatedAt: '2026-01-19T00:00:00.000Z',
            },
        ],
        status: 'draft',
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        bounceCount: 0,
        createdAt: '2026-01-19T00:00:00.000Z',
        variableValues: {
            companyName: 'Maskom',
            userName: 'Subscriber',
            userEmail: 'subscriber@example.com',
            supportEmail: 'support@maskom.com',
        },
    },
    {
        id: 'CAMP-002',
        name: 'Weekly Blog Digest - Week 3',
        templateId: 2,
        recipientLists: [
            {
                id: 'LIST-002',
                name: 'All Subscribers',
                segments: [
                    {
                        id: 'SEG-002',
                        name: 'All Users',
                        criteria: {},
                        count: 500,
                    },
                ],
                totalRecipients: 500,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-19T00:00:00.000Z',
            },
        ],
        scheduledFor: '2026-01-20T09:00:00.000Z',
        status: 'scheduled',
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        bounceCount: 0,
        createdAt: '2026-01-18T00:00:00.000Z',
        variableValues: {
            companyName: 'Maskom',
            userName: 'Subscriber',
            blogTitle: 'Top 10 Tips for Better Web Performance',
            blogDescription: 'Learn the best practices to optimize your website performance and improve user experience.',
            blogUrl: 'https://maskom.com/blog/top-10-performance-tips',
            authorName: 'John Doe',
        },
    },
    {
        id: 'CAMP-003',
        name: 'Feature Announcement - New Analytics Dashboard',
        templateId: 2,
        recipientLists: [
            {
                id: 'LIST-003',
                name: 'Active Users',
                segments: [
                    {
                        id: 'SEG-003',
                        name: 'Users with recent activity',
                        criteria: {
                            role: ['user', 'editor'],
                        },
                        count: 200,
                    },
                ],
                totalRecipients: 200,
                createdAt: '2026-01-10T00:00:00.000Z',
                updatedAt: '2026-01-19T00:00:00.000Z',
            },
        ],
        scheduledFor: '2026-12-31T14:00:00.000Z',
        status: 'scheduled',
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        bounceCount: 0,
        createdAt: '2026-01-19T00:00:00.000Z',
        variableValues: {
            companyName: 'Maskom',
            userName: 'Active User',
            blogTitle: 'Introducing Our New Analytics Dashboard',
            blogDescription: 'Check out the powerful new analytics features available in your admin panel.',
            blogUrl: 'https://maskom.com/blog/analytics-dashboard-launch',
            authorName: 'Jane Smith',
        },
    },
    {
        id: 'CAMP-004',
        name: 'Monthly Newsletter - January 2026',
        templateId: 2,
        recipientLists: [
            {
                id: 'LIST-004',
                name: 'Monthly Subscribers',
                segments: [
                    {
                        id: 'SEG-004',
                        name: 'Users opted in for monthly updates',
                        criteria: {
                            tags: ['newsletter'],
                        },
                        count: 350,
                    },
                ],
                totalRecipients: 350,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-19T00:00:00.000Z',
            },
        ],
        status: 'sent',
        sentCount: 350,
        openCount: 280,
        clickCount: 140,
        bounceCount: 5,
        createdAt: '2026-01-15T00:00:00.000Z',
        sentAt: '2026-01-15T09:00:00.000Z',
        variableValues: {
            companyName: 'Maskom',
            userName: 'Subscriber',
            blogTitle: 'January 2026 Newsletter',
            blogDescription: 'Discover what\'s new this month at Maskom.',
            blogUrl: 'https://maskom.com/blog/january-2026-newsletter',
            authorName: 'Editorial Team',
        },
    },
    {
        id: 'CAMP-005',
        name: 'Password Reset Campaign - Inactive Users',
        templateId: 3,
        recipientLists: [
            {
                id: 'LIST-005',
                name: 'Inactive Users',
                segments: [
                    {
                        id: 'SEG-005',
                        name: 'Users inactive for 90+ days',
                        criteria: {
                            customCriteria: {
                                lastLoginDays: 90,
                            },
                        },
                        count: 50,
                    },
                ],
                totalRecipients: 50,
                createdAt: '2026-01-10T00:00:00.000Z',
                updatedAt: '2026-01-19T00:00:00.000Z',
            },
        ],
        status: 'cancelled',
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        bounceCount: 0,
        createdAt: '2026-01-16T00:00:00.000Z',
        variableValues: {
            userName: 'Inactive User',
            resetPasswordUrl: 'https://maskom.com/reset-password?token=xyz',
            expiryHours: '24',
            supportEmail: 'support@maskom.com',
            companyName: 'Maskom',
        },
    },
];

export default campaign_data;
