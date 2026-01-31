export type PublishingWorkflowStage = 'draft' | 'review' | 'approved' | 'scheduled' | 'published';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type DistributionChannel = 'web' | 'email' | 'rss' | 'social';

export type RoleType = 'editor' | 'content_strategist' | 'admin';

export interface ApprovalAssignment {
    reviewerId: string;
    reviewerName: string;
    role: RoleType;
    assignedAt: string;
    status: ApprovalStatus;
    reviewComments?: string;
    reviewedAt?: string;
}

export interface ContentQualityGate {
    seoScore: number;
    readabilityScore: number;
    completenessCheck: boolean;
    passed: boolean;
    issues: string[];
}

export interface PublishingSchedule {
    postId: number;
    scheduledAt: string;
    timezone: string;
    timezoneOffset: number;
    createdBy: string;
    createdAt: string;
}

export interface DistributionConfig {
    channel: DistributionChannel;
    enabled: boolean;
    publishAt?: string;
    metadata?: Record<string, unknown>;
}

export interface PublishingWorkflow {
    postId: number;
    postTitle: string;
    currentStage: PublishingWorkflowStage;
    stages: PublishingWorkflowStage[];
    approvalAssignments: ApprovalAssignment[];
    schedule?: PublishingSchedule;
    distributionConfigs: DistributionConfig[];
    qualityGate?: ContentQualityGate;
    versionSnapshots: string[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export interface PublishingMetrics {
    totalPosts: number;
    publishedPosts: number;
    pendingApproval: number;
    scheduledPosts: number;
    draftPosts: number;
    avgTimeToPublish: number;
    avgApprovalCycleTime: number;
    onTimeDeliveryRate: number;
    postsByStage: Record<PublishingWorkflowStage, number>;
}

export interface CalendarEvent {
    postId: number;
    title: string;
    stage: PublishingWorkflowStage;
    scheduledAt?: string;
    createdBy: string;
    status: 'on-time' | 'delayed' | 'cancelled';
}

export interface BulkOperation {
    operationId: string;
    type: 'schedule' | 'approve' | 'publish';
    postIds: number[];
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    progress: number;
    errors: string[];
    createdAt: string;
}

export interface IPublishingPipeline {
    createWorkflow(postId: number, postTitle: string): PublishingWorkflow;
    advanceStage(workflowId: string, stage: PublishingWorkflowStage, userId: string): PublishingWorkflow | null;
    assignReviewer(workflowId: string, reviewerId: string, reviewerName: string, role: RoleType): boolean;
    submitReview(workflowId: string, reviewerId: string, approved: boolean, comments?: string): boolean;
    schedulePublishing(workflowId: string, scheduledAt: string, timezone: string, userId: string): boolean;
    checkQualityGates(postId: number): ContentQualityGate;
    configureDistribution(workflowId: string, channel: DistributionChannel, enabled: boolean, metadata?: Record<string, unknown>): boolean;
    createVersionSnapshot(workflowId: string, snapshotId: string): boolean;
    getWorkflows(stage?: PublishingWorkflowStage): PublishingWorkflow[];
    getWorkflowByPostId(postId: number): PublishingWorkflow | null;
    getMetrics(): PublishingMetrics;
    getCalendarEvents(startDate: string, endDate: string): CalendarEvent[];
    executeBulkOperation(operation: BulkOperation): Promise<boolean>;
}
