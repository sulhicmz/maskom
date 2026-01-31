import type {
    PublishingWorkflow,
    ApprovalAssignment,
    PublishingSchedule,
    DistributionConfig,
    ContentQualityGate,
    PublishingMetrics,
    CalendarEvent,
    IPublishingPipeline,
    PublishingWorkflowStage,
    ApprovalStatus,
    DistributionChannel,
    RoleType,
    BulkOperation,
} from '@/types/publishing';
import { versionStorage } from '@/utils/versionStorage';
import type { InnerBlogPost } from '@/types/data';

const WORKFLOW_STORAGE_KEY = 'publishing_workflows';
const BULK_OPERATIONS_KEY = 'publishing_bulk_operations';
const MAX_WORKFLOWS = 1000;
const MAX_VERSION_SNAPSHOTS = 20;

const DEFAULT_WORKFLOW_STAGES: PublishingWorkflowStage[] = ['draft', 'review', 'approved', 'scheduled', 'published'];

class PublishingPipeline implements IPublishingPipeline {
    private workflows: Map<string, PublishingWorkflow>;
    private bulkOperations: Map<string, BulkOperation>;

    constructor() {
        this.workflows = new Map();
        this.bulkOperations = new Map();
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(WORKFLOW_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                Object.entries(parsed).forEach(([key, value]) => {
                    this.workflows.set(key, value as PublishingWorkflow);
                });
            }

            const bulkStored = localStorage.getItem(BULK_OPERATIONS_KEY);
            if (bulkStored) {
                const parsed = JSON.parse(bulkStored);
                Object.entries(parsed).forEach(([key, value]) => {
                    this.bulkOperations.set(key, value as BulkOperation);
                });
            }
        } catch (error) {
            console.error('Failed to load publishing workflows from storage:', error);
        }
    }

    private saveToStorage(): void {
        try {
            const workflowsObj = Object.fromEntries(this.workflows);
            localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflowsObj));

            const bulkObj = Object.fromEntries(this.bulkOperations);
            localStorage.setItem(BULK_OPERATIONS_KEY, JSON.stringify(bulkObj));
        } catch (error) {
            console.error('Failed to save publishing workflows to storage:', error);
        }
    }

    private generateWorkflowId(): string {
        return `workflow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    private getWorkflowId(postId: number): string | null {
        for (const [id, workflow] of this.workflows.entries()) {
            if (workflow.postId === postId) {
                return id;
            }
        }
        return null;
    }

    private validateStageTransition(currentStage: PublishingWorkflowStage, nextStage: PublishingWorkflowStage): boolean {
        const stageOrder = DEFAULT_WORKFLOW_STAGES;
        const currentIndex = stageOrder.indexOf(currentStage);
        const nextIndex = stageOrder.indexOf(nextStage);

        return nextIndex > currentIndex;
    }

    createWorkflow(postId: number, postTitle: string): PublishingWorkflow {
        const workflowId = this.generateWorkflowId();
        const now = new Date().toISOString();

        const workflow: PublishingWorkflow = {
            postId,
            postTitle,
            currentStage: 'draft',
            stages: DEFAULT_WORKFLOW_STAGES,
            approvalAssignments: [],
            distributionConfigs: [
                { channel: 'web', enabled: true },
                { channel: 'email', enabled: false },
                { channel: 'rss', enabled: true },
                { channel: 'social', enabled: false },
            ],
            versionSnapshots: [],
            createdAt: now,
            updatedAt: now,
            createdBy: 'system',
        };

        if (this.workflows.size >= MAX_WORKFLOWS) {
            const entries = Array.from(this.workflows.entries());
            entries.sort((a, b) => a[1].createdAt.localeCompare(b[1].createdAt));
            this.workflows.delete(entries[0][0]);
        }

        this.workflows.set(workflowId, workflow);
        this.saveToStorage();

        return workflow;
    }

    advanceStage(workflowId: string, stage: PublishingWorkflowStage, userId: string): PublishingWorkflow | null {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            return null;
        }

        if (!this.validateStageTransition(workflow.currentStage, stage)) {
            return null;
        }

        workflow.currentStage = stage;
        workflow.updatedAt = new Date().toISOString();

        const snapshotId = this.generateWorkflowId().replace('workflow', 'snapshot');
        this.createVersionSnapshot(workflowId, snapshotId);

        this.workflows.set(workflowId, workflow);
        this.saveToStorage();

        return workflow;
    }

    assignReviewer(workflowId: string, reviewerId: string, reviewerName: string, role: RoleType): boolean {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            return false;
        }

        const existingAssignment = workflow.approvalAssignments.find(
            (assignment) => assignment.reviewerId === reviewerId
        );

        if (existingAssignment) {
            return false;
        }

        const assignment: ApprovalAssignment = {
            reviewerId,
            reviewerName,
            role,
            assignedAt: new Date().toISOString(),
            status: 'pending',
        };

        workflow.approvalAssignments.push(assignment);
        workflow.updatedAt = new Date().toISOString();

        this.workflows.set(workflowId, workflow);
        this.saveToStorage();

        return true;
    }

    submitReview(workflowId: string, reviewerId: string, approved: boolean, comments?: string): boolean {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            return false;
        }

        const assignment = workflow.approvalAssignments.find((a) => a.reviewerId === reviewerId);
        if (!assignment || assignment.status !== 'pending') {
            return false;
        }

        assignment.status = approved ? 'approved' : 'rejected';
        assignment.reviewComments = comments;
        assignment.reviewedAt = new Date().toISOString();

        workflow.updatedAt = new Date().toISOString();

        const allApproved = workflow.approvalAssignments.every((a) => a.status === 'approved');
        if (allApproved && workflow.currentStage === 'review') {
            this.advanceStage(workflowId, 'approved', reviewerId);
        }

        this.workflows.set(workflowId, workflow);
        this.saveToStorage();

        return true;
    }

    schedulePublishing(workflowId: string, scheduledAt: string, timezone: string, userId: string): boolean {
        const workflow = this.workflows.get(workflowId);
        if (!workflow || workflow.currentStage !== 'approved') {
            return false;
        }

        const schedule: PublishingSchedule = {
            postId: workflow.postId,
            scheduledAt,
            timezone,
            timezoneOffset: this.getTimezoneOffset(timezone),
            createdBy: userId,
            createdAt: new Date().toISOString(),
        };

        workflow.schedule = schedule;
        this.advanceStage(workflowId, 'scheduled', userId);

        this.workflows.set(workflowId, workflow);
        this.saveToStorage();

        return true;
    }

    private getTimezoneOffset(timezone: string): number {
        try {
            const date = new Date();
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
            return (tzDate.getTime() - utcDate.getTime()) / 60000;
        } catch {
            return 0;
        }
    }

    checkQualityGates(postId: number): ContentQualityGate {
        const issues: string[] = [];
        let passed = true;
        let seoScore = 100;
        let readabilityScore = 100;
        let completenessCheck = true;

        try {
            const versions = versionStorage.getPostVersions(postId);
            const latestVersion = versions[versions.length - 1];

            if (latestVersion && latestVersion.content) {
                const content = latestVersion.content as InnerBlogPost;

            if (!content.title || content.title.length < 10) {
                issues.push('Judul harus minimal 10 karakter');
                seoScore -= 20;
                completenessCheck = false;
            }

            if (!content.desc || content.desc.length < 50) {
                issues.push('Deskripsi harus minimal 50 karakter');
                seoScore -= 20;
                completenessCheck = false;
            }

            if (!content.desc || content.desc.length < 300) {
                issues.push('Konten harus minimal 300 karakter');
                readabilityScore -= 30;
                completenessCheck = false;
            }

            if (!content.categoryId) {
                issues.push('Kategori wajib dipilih');
                seoScore -= 10;
                completenessCheck = false;
            }

            if (!content.tagId) {
                issues.push('Tag wajib dipilih');
                seoScore -= 10;
                completenessCheck = false;
            }

            if (content.desc) {
                const words = content.desc.split(/\s+/).filter((w: string) => w.length > 0);
                const sentences = content.desc.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);

                if (words.length > 0 && sentences.length > 0) {
                    const avgWordsPerSentence = words.length / sentences.length;
                    if (avgWordsPerSentence > 25) {
                        issues.push('Kalimat terlalu panjang (rata-rata > 25 kata)');
                        readabilityScore -= 15;
                    }

                    if (avgWordsPerSentence < 10) {
                        issues.push('Kalimat terlalu pendek (rata-rata < 10 kata)');
                        readabilityScore -= 10;
                    }
                }

                const longSentences = sentences.filter((s: string) => s.split(/\s+/).length > 30);
                if (longSentences.length > sentences.length * 0.2) {
                    issues.push('Lebih dari 20% kalimat memiliki > 30 kata');
                    readabilityScore -= 10;
                }
            }
            } else {
                issues.push('Tidak ada versi konten yang tersedia');
                passed = false;
            }
        } catch (error) {
            issues.push('Gagal memeriksa kualitas konten');
            passed = false;
        }

        seoScore = Math.max(0, Math.min(100, seoScore));
        readabilityScore = Math.max(0, Math.min(100, readabilityScore));

        passed = seoScore >= 70 && readabilityScore >= 60 && completenessCheck;

        return {
            seoScore,
            readabilityScore,
            completenessCheck,
            passed,
            issues,
        };
    }

    configureDistribution(workflowId: string, channel: DistributionChannel, enabled: boolean, metadata?: Record<string, unknown>): boolean {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            return false;
        }

        const configIndex = workflow.distributionConfigs.findIndex((c) => c.channel === channel);
        if (configIndex >= 0) {
            workflow.distributionConfigs[configIndex] = {
                channel,
                enabled,
                metadata: metadata || workflow.distributionConfigs[configIndex].metadata,
            };
        } else {
            workflow.distributionConfigs.push({ channel, enabled, metadata });
        }

        workflow.updatedAt = new Date().toISOString();

        this.workflows.set(workflowId, workflow);
        this.saveToStorage();

        return true;
    }

    createVersionSnapshot(workflowId: string, snapshotId: string): boolean {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            return false;
        }

        workflow.versionSnapshots.push(snapshotId);

        if (workflow.versionSnapshots.length > MAX_VERSION_SNAPSHOTS) {
            workflow.versionSnapshots = workflow.versionSnapshots.slice(-MAX_VERSION_SNAPSHOTS);
        }

        workflow.updatedAt = new Date().toISOString();

        this.workflows.set(workflowId, workflow);
        this.saveToStorage();

        return true;
    }

    getWorkflows(stage?: PublishingWorkflowStage): PublishingWorkflow[] {
        const allWorkflows = Array.from(this.workflows.values());

        if (stage) {
            return allWorkflows.filter((w) => w.currentStage === stage);
        }

        return allWorkflows;
    }

    getWorkflowByPostId(postId: number): PublishingWorkflow | null {
        const workflowId = this.getWorkflowId(postId);
        return workflowId ? this.workflows.get(workflowId) || null : null;
    }

    getMetrics(): PublishingMetrics {
        const workflows = Array.from(this.workflows.values());

        const publishedPosts = workflows.filter((w) => w.currentStage === 'published');
        const scheduledPosts = workflows.filter((w) => w.currentStage === 'scheduled');
        const pendingApproval = workflows.filter((w) => w.currentStage === 'review');
        const draftPosts = workflows.filter((w) => w.currentStage === 'draft');

        const totalPosts = workflows.length;

        const postsByStage: Record<PublishingWorkflowStage, number> = {
            draft: draftPosts.length,
            review: pendingApproval.length,
            approved: workflows.filter((w) => w.currentStage === 'approved').length,
            scheduled: scheduledPosts.length,
            published: publishedPosts.length,
        };

        const now = Date.now();
        let totalTimeToPublish = 0;
        let publishCount = 0;
        let onTimeCount = 0;
        let totalApprovalCycleTime = 0;
        let approvalCount = 0;

        publishedPosts.forEach((workflow) => {
            const createdAt = new Date(workflow.createdAt).getTime();
            const timeToPublish = now - createdAt;
            totalTimeToPublish += timeToPublish;
            publishCount++;

            if (workflow.schedule) {
                const scheduledAt = new Date(workflow.schedule.scheduledAt).getTime();
                if (now >= scheduledAt) {
                    const delay = now - scheduledAt;
                    if (delay <= 60000) {
                        onTimeCount++;
                    }
                }
            }
        });

        workflows.forEach((workflow) => {
            if (workflow.approvalAssignments.length > 0) {
                const firstAssignment = workflow.approvalAssignments[0];
                const lastReview = workflow.approvalAssignments
                    .filter((a) => a.reviewedAt)
                    .sort((a, b) => new Date(b.reviewedAt!).getTime() - new Date(a.reviewedAt!).getTime())[0];

                if (lastReview && lastReview.reviewedAt) {
                    const cycleTime = new Date(lastReview.reviewedAt).getTime() - new Date(firstAssignment.assignedAt).getTime();
                    totalApprovalCycleTime += cycleTime;
                    approvalCount++;
                }
            }
        });

        const avgTimeToPublish = publishCount > 0 ? totalTimeToPublish / publishCount : 0;
        const avgApprovalCycleTime = approvalCount > 0 ? totalApprovalCycleTime / approvalCount : 0;
        const onTimeDeliveryRate = publishCount > 0 ? (onTimeCount / publishCount) * 100 : 0;

        return {
            totalPosts,
            publishedPosts: publishedPosts.length,
            pendingApproval: pendingApproval.length,
            scheduledPosts: scheduledPosts.length,
            draftPosts: draftPosts.length,
            avgTimeToPublish: avgTimeToPublish / 1000 / 60,
            avgApprovalCycleTime: avgApprovalCycleTime / 1000 / 60,
            onTimeDeliveryRate,
            postsByStage,
        };
    }

    getCalendarEvents(startDate: string, endDate: string): CalendarEvent[] {
        const workflows = Array.from(this.workflows.values());
        const events: CalendarEvent[] = [];

        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const now = Date.now();

        workflows.forEach((workflow) => {
            const status: CalendarEvent['status'] = workflow.currentStage === 'published' ? 'on-time' : 'delayed';

            if (workflow.schedule) {
                const scheduledAt = new Date(workflow.schedule.scheduledAt).getTime();
                if (scheduledAt >= start && scheduledAt <= end) {
                    events.push({
                        postId: workflow.postId,
                        title: workflow.postTitle,
                        stage: workflow.currentStage,
                        scheduledAt: workflow.schedule.scheduledAt,
                        createdBy: workflow.schedule.createdBy,
                        status: scheduledAt <= now ? 'delayed' : 'on-time',
                    });
                }
            }
        });

        return events;
    }

    async executeBulkOperation(operation: BulkOperation): Promise<boolean> {
        this.bulkOperations.set(operation.operationId, operation);
        this.saveToStorage();

        operation.status = 'in-progress';
        this.saveToStorage();

        const errors: string[] = [];

        try {
            for (let i = 0; i < operation.postIds.length; i++) {
                const postId = operation.postIds[i];
                const workflowId = this.getWorkflowId(postId);

                if (!workflowId) {
                    errors.push(`Post ID ${postId} tidak ditemukan`);
                    continue;
                }

                const workflow = this.workflows.get(workflowId);
                if (!workflow) {
                    errors.push(`Workflow untuk post ID ${postId} tidak ditemukan`);
                    continue;
                }

                operation.progress = ((i + 1) / operation.postIds.length) * 100;
                this.saveToStorage();

                await new Promise((resolve) => setTimeout(resolve, 100));

                switch (operation.type) {
                    case 'schedule':
                        if (workflow.currentStage === 'approved') {
                            errors.push(`Post ID ${postId} belum disetujui`);
                        }
                        break;

                    case 'approve':
                        if (workflow.currentStage === 'review') {
                            this.advanceStage(workflowId, 'approved', 'system');
                        } else {
                            errors.push(`Post ID ${postId} tidak dalam tahap review`);
                        }
                        break;

                    case 'publish':
                        if (workflow.currentStage === 'scheduled') {
                            this.advanceStage(workflowId, 'published', 'system');
                        } else {
                            errors.push(`Post ID ${postId} tidak dalam tahap scheduled`);
                        }
                        break;
                }
            }

            operation.status = errors.length > 0 ? 'failed' : 'completed';
            operation.errors = errors;
            this.saveToStorage();

            return errors.length === 0;
        } catch (error) {
            operation.status = 'failed';
            errors.push(error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui');
            operation.errors = errors;
            this.saveToStorage();

            return false;
        }
    }

    clearWorkflows(): void {
        this.workflows.clear();
        this.saveToStorage();
    }
}

const publishingPipeline = new PublishingPipeline();

export default publishingPipeline;
