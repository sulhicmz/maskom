import { z } from 'zod';
import { StorageValidator } from '../storageValidator';
import {
  PersonalizationExperiment,
  ExperimentVariant,
  ExperimentStatus,
  ExperimentResult,
  ExperimentAlert,
  ExperimentTemplate,
  ExperimentAutomationConfig,
  ExperimentQueue,
  ExperimentHistory,
  IPersonalizationExperimentAutomation,
  PersonalizationRule,
  UserSegment,
} from '@/types/personalization';

const EXPERIMENTS_STORAGE_KEY = 'personalization_experiments';
const QUEUE_STORAGE_KEY = 'experiment_queue';
const TEMPLATES_STORAGE_KEY = 'experiment_templates';
const HISTORY_STORAGE_KEY = 'experiment_history';

const experimentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['draft', 'scheduled', 'running', 'paused', 'completed', 'failed']),
  scheduleMode: z.enum(['sequential', 'parallel', 'manual']),
  successMetric: z.enum(['conversion_rate', 'engagement_rate', 'lift', 'revenue']),
  variants: z.array(
    z.object({
      id: z.string(),
      experimentId: z.string(),
      variantName: z.string(),
      ruleId: z.string(),
      weight: z.number(),
      isControl: z.boolean(),
      metrics: z.object({
        impressions: z.number().default(0),
        conversions: z.number().default(0),
        engagement: z.number().default(0),
        revenue: z.number().default(0),
      }),
      assignedUsers: z.array(z.string()).default([]),
    })
  ),
  rules: z.array(z.any()),
  automationConfig: z.object({
    autoStart: z.boolean(),
    autoStop: z.boolean(),
    autoWinnerDeclaration: z.boolean(),
    minSampleSize: z.number(),
    minDuration: z.number(),
    maxDuration: z.number(),
    confidenceThreshold: z.number(),
    sampleSizeThreshold: z.number(),
    durationThreshold: z.number(),
    stopOnNegativeLift: z.boolean(),
    rollbackOnFailure: z.boolean(),
  }),
  createdAt: z.string(),
  scheduledAt: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  winner: z.object({
    experimentId: z.string(),
    winnerId: z.string(),
    winnerName: z.string(),
    loserId: z.string(),
    loserName: z.string(),
    statisticalSignificance: z.boolean(),
    pValue: z.number(),
    confidenceLevel: z.number(),
    confidenceInterval: z.object({
      winner: z.object({ lower: z.number(), upper: z.number() }),
      loser: z.object({ lower: z.number(), upper: z.number() }),
    }),
    lift: z.number(),
    declaredAt: z.string(),
  }).nullable(),
  alerts: z.array(
    z.object({
      id: z.string(),
      experimentId: z.string(),
      type: z.enum(['info', 'warning', 'critical']),
      message: z.string(),
      createdAt: z.string(),
      acknowledged: z.boolean(),
    })
  ),
});

const queueSchema = z.object({
  experiments: z.array(z.string()),
  currentExperiment: z.string().optional(),
  mode: z.enum(['sequential', 'parallel', 'manual']),
});

const historySchema = z.record(
  z.string(),
  z.object({
    statusChanges: z.array(
      z.object({
        from: z.enum(['draft', 'scheduled', 'running', 'paused', 'completed', 'failed']),
        to: z.enum(['draft', 'scheduled', 'running', 'paused', 'completed', 'failed']),
        timestamp: z.string(),
      })
    ),
    metricsSnapshots: z.array(
      z.object({
        timestamp: z.string(),
        variantId: z.string(),
        metrics: z.object({
          impressions: z.number(),
          conversions: z.number(),
          engagement: z.number(),
          revenue: z.number(),
        }),
      })
    ),
    alerts: z.array(
      z.object({
        id: z.string(),
        experimentId: z.string(),
        type: z.enum(['info', 'warning', 'critical']),
        message: z.string(),
        createdAt: z.string(),
        acknowledged: z.boolean(),
      })
    ),
  })
);

const experimentsArraySchema = z.array(experimentSchema);

const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['headline_test', 'cta_test', 'layout_test', 'content_test']),
  category: z.enum(['engagement', 'conversion', 'retention']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  config: z.object({
    autoStart: z.boolean(),
    autoStop: z.boolean(),
    autoWinnerDeclaration: z.boolean(),
    minSampleSize: z.number(),
    minDuration: z.number(),
    maxDuration: z.number(),
    confidenceThreshold: z.number(),
    sampleSizeThreshold: z.number(),
    durationThreshold: z.number(),
    stopOnNegativeLift: z.boolean(),
    rollbackOnFailure: z.boolean(),
  }),
  variants: z.array(
    z.object({
      variantName: z.string(),
      ruleId: z.string(),
      weight: z.number(),
      isControl: z.boolean(),
    })
  ),
  useCases: z.array(z.string()),
  expectedDuration: z.number(),
  estimatedLift: z.number(),
});

const templatesArraySchema = z.array(templateSchema);

export class PersonalizationExperimentAutomation implements IPersonalizationExperimentAutomation {
  private experiments: Map<string, PersonalizationExperiment> = new Map();
  private queue: ExperimentQueue = { experiments: [], mode: 'sequential' };
  private history: Map<string, ExperimentHistory> = new Map();
  private templates: Map<string, ExperimentTemplate> = new Map();
  
  private experimentsValidator: StorageValidator<PersonalizationExperiment[]>;
  private queueValidator: StorageValidator<ExperimentQueue>;
  private historyValidator: StorageValidator<Record<string, ExperimentHistory>>;
  private templatesValidator: StorageValidator<ExperimentTemplate[]>;

  private automationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.experimentsValidator = new StorageValidator<PersonalizationExperiment[]>({
      schema: experimentsArraySchema,
      defaultValue: [],
      storageKey: EXPERIMENTS_STORAGE_KEY,
      logErrors: true,
    });

    this.queueValidator = new StorageValidator<ExperimentQueue>({
      schema: queueSchema,
      defaultValue: { experiments: [], mode: 'sequential' },
      storageKey: QUEUE_STORAGE_KEY,
      logErrors: true,
    });

    this.historyValidator = new StorageValidator<Record<string, ExperimentHistory>>({
      schema: historySchema,
      defaultValue: {},
      storageKey: HISTORY_STORAGE_KEY,
      logErrors: true,
    });

    this.templatesValidator = new StorageValidator<ExperimentTemplate[]>({
      schema: templatesArraySchema,
      defaultValue: [],
      storageKey: TEMPLATES_STORAGE_KEY,
      logErrors: true,
    });

    this.loadExperiments();
    this.loadQueue();
    this.loadHistory();
    this.loadTemplates();
    this.initializeTemplates();
    this.startAutomation();
  }

  private loadExperiments(): void {
    const stored = localStorage.getItem(EXPERIMENTS_STORAGE_KEY);
    if (stored) {
      const experiments = this.experimentsValidator.safeParseFromStorage(stored);
      experiments.forEach(exp => this.experiments.set(exp.id, exp));
    }
  }

  private saveExperiments(): void {
    const experimentsArray = Array.from(this.experiments.values());
    const result = this.experimentsValidator.parse(experimentsArray);
    if (result.success) {
      localStorage.setItem(EXPERIMENTS_STORAGE_KEY, JSON.stringify(result.data));
    } else {
      console.error('[PersonalizationExperimentAutomation] Failed to save experiments:', result.error);
    }
  }

  private loadQueue(): void {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (stored) {
      const queue = this.queueValidator.safeParseFromStorage(stored);
      this.queue = queue;
    }
  }

  private saveQueue(): void {
    const result = this.queueValidator.parse(this.queue);
    if (result.success) {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(result.data));
    }
  }

  private loadHistory(): void {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      const history = this.historyValidator.safeParseFromStorage(stored);
      Object.entries(history).forEach(([id, hist]) => {
        this.history.set(id, hist);
      });
    }
  }

  private saveHistory(): void {
    const historyObj = Object.fromEntries(this.history);
    const result = this.historyValidator.parse(historyObj);
    if (result.success) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(result.data));
    }
  }

  private loadTemplates(): void {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (stored) {
      const templates = this.templatesValidator.safeParseFromStorage(stored);
      templates.forEach(tpl => this.templates.set(tpl.id, tpl));
    }
  }

  private saveTemplates(): void {
    const templatesArray = Array.from(this.templates.values());
    const result = this.templatesValidator.parse(templatesArray);
    if (result.success) {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(result.data));
    }
  }

  private initializeTemplates(): void {
    if (this.templates.size === 0) {
      const defaultTemplates: ExperimentTemplate[] = [
        {
          id: 'tpl-headline-welcome',
          name: 'Headline Test - Welcome Message',
          description: 'Test different headline variations for new visitor welcome messages',
          type: 'headline_test',
          category: 'engagement',
          difficulty: 'beginner',
          config: {
            autoStart: true,
            autoStop: true,
            autoWinnerDeclaration: true,
            minSampleSize: 1000,
            minDuration: 7,
            maxDuration: 14,
            confidenceThreshold: 0.95,
            sampleSizeThreshold: 1000,
            durationThreshold: 7,
            stopOnNegativeLift: true,
            rollbackOnFailure: false,
          },
          variants: [
            {
              variantName: 'Control',
              ruleId: '',
              weight: 50,
              isControl: true,
            },
            {
              variantName: 'Variant A - Personal',
              ruleId: '',
              weight: 50,
              isControl: false,
            },
          ],
          useCases: ['New user onboarding', 'Welcome message optimization'],
          expectedDuration: 7,
          estimatedLift: 15,
        },
        {
          id: 'tpl-cta-signup',
          name: 'CTA Test - Sign Up Button',
          description: 'Test different CTA text and button styles for sign up conversions',
          type: 'cta_test',
          category: 'conversion',
          difficulty: 'intermediate',
          config: {
            autoStart: true,
            autoStop: true,
            autoWinnerDeclaration: true,
            minSampleSize: 2000,
            minDuration: 7,
            maxDuration: 21,
            confidenceThreshold: 0.95,
            sampleSizeThreshold: 2000,
            durationThreshold: 7,
            stopOnNegativeLift: true,
            rollbackOnFailure: true,
          },
          variants: [
            {
              variantName: 'Control - Sign Up',
              ruleId: '',
              weight: 50,
              isControl: true,
            },
            {
              variantName: 'Variant A - Get Started Free',
              ruleId: '',
              weight: 50,
              isControl: false,
            },
          ],
          useCases: ['Sign up flow optimization', 'Conversion rate improvement'],
          expectedDuration: 14,
          estimatedLift: 20,
        },
        {
          id: 'tpl-layout-blog',
          name: 'Layout Test - Blog Listing',
          description: 'Test different blog listing layouts for engagement optimization',
          type: 'layout_test',
          category: 'engagement',
          difficulty: 'advanced',
          config: {
            autoStart: false,
            autoStop: true,
            autoWinnerDeclaration: true,
            minSampleSize: 3000,
            minDuration: 14,
            maxDuration: 28,
            confidenceThreshold: 0.95,
            sampleSizeThreshold: 3000,
            durationThreshold: 14,
            stopOnNegativeLift: false,
            rollbackOnFailure: false,
          },
          variants: [
            {
              variantName: 'Control - Grid Layout',
              ruleId: '',
              weight: 50,
              isControl: true,
            },
            {
              variantName: 'Variant A - List Layout',
              ruleId: '',
              weight: 50,
              isControl: false,
            },
          ],
          useCases: ['Blog engagement optimization', 'Content discovery'],
          expectedDuration: 21,
          estimatedLift: 10,
        },
      ];

      defaultTemplates.forEach(tpl => {
        this.templates.set(tpl.id, tpl);
      });
      this.saveTemplates();
    }
  }

  private startAutomation(): void {
    this.automationInterval = setInterval(() => {
      this.processAutomationRules();
    }, 60000);
  }

  private stopAutomation(): void {
    if (this.automationInterval) {
      clearInterval(this.automationInterval);
      this.automationInterval = null;
    }
  }

  createExperiment(config: Omit<PersonalizationExperiment, 'id' | 'createdAt' | 'alerts'>): PersonalizationExperiment {
    const id = this.generateExperimentId();
    const now = new Date().toISOString();
    
    const newExperiment: PersonalizationExperiment = {
      ...config,
      id,
      createdAt: now,
      alerts: [],
    };

    this.experiments.set(id, newExperiment);
    this.saveExperiments();

    this.initializeHistory(id);

    return newExperiment;
  }

  startExperiment(experimentId: string): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return false;
    }

    if (experiment.status !== 'draft' && experiment.status !== 'scheduled') {
      return false;
    }

    const now = new Date().toISOString();
    experiment.status = 'running';
    experiment.startedAt = now;

    if (!experiment.history) {
      this.initializeHistory(experimentId);
    }

    this.updateHistoryStatus(experimentId, experiment.status === 'scheduled' ? 'scheduled' : 'draft', 'running', now);
    this.saveExperiments();
    this.saveHistory();

    this.addAlert(experimentId, 'info', `Experiment started at ${now}`);

    return true;
  }

  stopExperiment(experimentId: string, reason?: string): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return false;
    }

    const now = new Date().toISOString();
    experiment.status = 'completed';
    experiment.completedAt = now;

    this.updateHistoryStatus(experimentId, 'running', 'completed', now);
    this.saveExperiments();
    this.saveHistory();

    this.addAlert(experimentId, 'info', `Experiment stopped at ${now}${reason ? `: ${reason}` : ''}`);

    return true;
  }

  pauseExperiment(experimentId: string): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return false;
    }

    const now = new Date().toISOString();
    experiment.status = 'paused';

    this.updateHistoryStatus(experimentId, 'running', 'paused', now);
    this.saveExperiments();
    this.saveHistory();

    this.addAlert(experimentId, 'info', `Experiment paused at ${now}`);

    return true;
  }

  resumeExperiment(experimentId: string): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'paused') {
      return false;
    }

    const now = new Date().toISOString();
    experiment.status = 'running';

    this.updateHistoryStatus(experimentId, 'paused', 'running', now);
    this.saveExperiments();
    this.saveHistory();

    this.addAlert(experimentId, 'info', `Experiment resumed at ${now}`);

    return true;
  }

  deleteExperiment(experimentId: string): boolean {
    if (!this.experiments.has(experimentId)) {
      return false;
    }

    this.experiments.delete(experimentId);
    this.history.delete(experimentId);
    this.removeExperimentFromQueue(experimentId);
    this.saveExperiments();
    this.saveHistory();
    this.saveQueue();

    return true;
  }

  getExperiment(experimentId: string): PersonalizationExperiment | undefined {
    return this.experiments.get(experimentId);
  }

  getAllExperiments(): PersonalizationExperiment[] {
    return Array.from(this.experiments.values()).sort((a, b) => {
      const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      return b.id.localeCompare(a.id);
    });
  }

  getExperimentsByStatus(status: ExperimentStatus): PersonalizationExperiment[] {
    return this.getAllExperiments().filter(exp => exp.status === status);
  }

  scheduleExperiment(experimentId: string, scheduledAt: string): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'draft') {
      return false;
    }

    const now = new Date().toISOString();
    experiment.status = 'scheduled';
    experiment.scheduledAt = scheduledAt;

    this.updateHistoryStatus(experimentId, 'draft', 'scheduled', now);
    this.saveExperiments();
    this.saveHistory();

    this.addExperimentToQueue(experimentId);
    this.addAlert(experimentId, 'info', `Experiment scheduled for ${scheduledAt}`);

    return true;
  }

  declareWinner(experimentId: string): ExperimentResult | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.variants.length < 2) {
      return null;
    }

    const sortedVariants = [...experiment.variants].sort((a, b) => {
      const aScore = this.calculateVariantScore(a, experiment.successMetric);
      const bScore = this.calculateVariantScore(b, experiment.successMetric);
      return bScore - aScore;
    });

    const winner = sortedVariants[0];
    const loser = sortedVariants[1];

    if (!winner.metrics.impressions || !loser.metrics.impressions) {
      return null;
    }

    const winnerConversionRate = winner.metrics.conversions / winner.metrics.impressions;
    const loserConversionRate = loser.metrics.conversions / loser.metrics.impressions;

    const pValue = this.calculatePValue(
      winner.metrics.conversions,
      winner.metrics.impressions,
      loser.metrics.conversions,
      loser.metrics.impressions
    );

    const isSignificant = pValue < experiment.automationConfig.confidenceThreshold;

    const result: ExperimentResult = {
      experimentId,
      winnerId: winner.id,
      winnerName: winner.variantName,
      loserId: loser.id,
      loserName: loser.variantName,
      statisticalSignificance: isSignificant,
      pValue,
      confidenceLevel: experiment.automationConfig.confidenceThreshold,
      confidenceInterval: {
        winner: this.calculateConfidenceInterval(winnerConversionRate, winner.metrics.impressions),
        loser: this.calculateConfidenceInterval(loserConversionRate, loser.metrics.impressions),
      },
      lift: this.calculateUplift(loserConversionRate, winnerConversionRate),
      declaredAt: new Date().toISOString(),
    };

    experiment.winner = result;
    experiment.status = 'completed';
    experiment.completedAt = result.declaredAt;

    this.saveExperiments();
    this.addAlert(experimentId, isSignificant ? 'info' : 'warning', 
      `Winner declared: ${winner.variantName} (${isSignificant ? 'significant' : 'not significant'})`);

    return result;
  }

  rollbackExperiment(experimentId: string): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || !experiment.winner) {
      return false;
    }

    experiment.winner = undefined;
    experiment.status = 'running';
    experiment.startedAt = new Date().toISOString();

    this.saveExperiments();
    this.addAlert(experimentId, 'warning', 'Experiment rolled back to running state');

    return true;
  }

  getExperimentHistory(experimentId: string): ExperimentHistory | undefined {
    return this.history.get(experimentId);
  }

  getAvailableTemplates(): ExperimentTemplate[] {
    return Array.from(this.templates.values());
  }

  applyTemplate(templateId: string, config: Partial<ExperimentAutomationConfig>): PersonalizationExperiment {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const mergedConfig: ExperimentAutomationConfig = {
      ...template.config,
      ...config,
    };

    const variants: ExperimentVariant[] = template.variants.map((v, idx) => ({
      ...v,
      id: `var-${Date.now()}-${idx}`,
      experimentId: '',
      metrics: {
        impressions: 0,
        conversions: 0,
        engagement: 0,
        revenue: 0,
      },
      assignedUsers: [],
    }));

    return this.createExperiment({
      name: template.name,
      description: template.description,
      status: 'draft',
      scheduleMode: 'manual',
      successMetric: 'conversion_rate',
      variants,
      rules: [],
      automationConfig: mergedConfig,
    });
  }

  trackMetric(experimentId: string, variantId: string, metric: keyof ExperimentVariant['metrics'], value: number): void {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return;
    }

    const variant = experiment.variants.find(v => v.id === variantId);
    if (!variant) {
      return;
    }

    variant.metrics[metric] += value;
    this.saveExperiments();

    this.recordMetricsSnapshot(experimentId, variantId, variant.metrics);
  }

  processAutomationRules(): void {
    const now = Date.now();
    const experiments = this.getAllExperiments().filter(exp => exp.status === 'running');

    experiments.forEach(experiment => {
      if (!experiment.startedAt) {
        return;
      }

      const startedAt = new Date(experiment.startedAt).getTime();
      const elapsedDays = (now - startedAt) / (1000 * 60 * 60 * 24);

      const totalImpressions = experiment.variants.reduce((sum, v) => sum + v.metrics.impressions, 0);
      const totalConversions = experiment.variants.reduce((sum, v) => sum + v.metrics.conversions, 0);

      if (experiment.automationConfig.autoStop && elapsedDays >= experiment.automationConfig.maxDuration) {
        this.stopExperiment(experiment.id, 'Maximum duration reached');
        return;
      }

      if (totalImpressions >= experiment.automationConfig.sampleSizeThreshold) {
        if (experiment.automationConfig.autoWinnerDeclaration) {
          const result = this.declareWinner(experiment.id);
          if (result && result.statisticalSignificance) {
            this.stopExperiment(experiment.id, 'Winner declared with statistical significance');
          }
        }
      }

      if (elapsedDays >= experiment.automationConfig.durationThreshold) {
        if (totalImpressions >= experiment.automationConfig.minSampleSize) {
          if (experiment.automationConfig.autoWinnerDeclaration) {
            const result = this.declareWinner(experiment.id);
            if (result) {
              this.stopExperiment(experiment.id, 'Duration threshold reached');
            }
          }
        }
      }

      if (experiment.automationConfig.stopOnNegativeLift && experiment.variants.length >= 2) {
        const control = experiment.variants.find(v => v.isControl);
        const treatment = experiment.variants.find(v => !v.isControl);
        if (control && treatment) {
          const controlRate = control.metrics.impressions > 0 
            ? control.metrics.conversions / control.metrics.impressions 
            : 0;
          const treatmentRate = treatment.metrics.impressions > 0 
            ? treatment.metrics.conversions / treatment.metrics.impressions 
            : 0;
          const lift = this.calculateUplift(controlRate, treatmentRate);
          if (lift < 0 && treatment.metrics.impressions >= experiment.automationConfig.minSampleSize) {
            this.stopExperiment(experiment.id, 'Negative lift detected');
            this.addAlert(experiment.id, 'warning', `Negative lift detected: ${lift.toFixed(2)}%`);
          }
        }
      }
    });
  }

  checkAlerts(): ExperimentAlert[] {
    const allAlerts: ExperimentAlert[] = [];
    this.experiments.forEach(experiment => {
      allAlerts.push(...experiment.alerts.filter(a => !a.acknowledged));
    });
    return allAlerts;
  }

  getExperimentQueue(): ExperimentQueue {
    return this.queue;
  }

  addExperimentToQueue(experimentId: string): void {
    if (!this.queue.experiments.includes(experimentId)) {
      this.queue.experiments.push(experimentId);
      this.saveQueue();
    }
  }

  removeExperimentFromQueue(experimentId: string): void {
    this.queue.experiments = this.queue.experiments.filter(id => id !== experimentId);
    this.saveQueue();
  }

  private initializeHistory(experimentId: string): void {
    const history: ExperimentHistory = {
      statusChanges: [],
      metricsSnapshots: [],
      alerts: [],
    };
    this.history.set(experimentId, history);
  }

  private updateHistoryStatus(experimentId: string, from: ExperimentStatus, to: ExperimentStatus, timestamp: string): void {
    const history = this.history.get(experimentId);
    if (!history) {
      return;
    }
    history.statusChanges.push({ from, to, timestamp });
  }

  private recordMetricsSnapshot(experimentId: string, variantId: string, metrics: ExperimentVariant['metrics']): void {
    const history = this.history.get(experimentId);
    if (!history) {
      return;
    }
    
    history.metricsSnapshots.push({
      timestamp: new Date().toISOString(),
      variantId,
      metrics: { ...metrics },
    });

    if (history.metricsSnapshots.length > 500) {
      history.metricsSnapshots = history.metricsSnapshots.slice(-500);
    }
  }

  private addAlert(experimentId: string, type: 'info' | 'warning' | 'critical', message: string): void {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return;
    }

    const alert: ExperimentAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      experimentId,
      type,
      message,
      createdAt: new Date().toISOString(),
      acknowledged: false,
    };

    experiment.alerts.push(alert);
    this.saveExperiments();

    const history = this.history.get(experimentId);
    if (history) {
      history.alerts.push(alert);
      this.saveHistory();
    }
  }

  private calculateVariantScore(variant: ExperimentVariant, metric: string): number {
    const impressions = variant.metrics.impressions || 1;
    switch (metric) {
      case 'conversion_rate':
        return impressions > 0 ? variant.metrics.conversions / impressions : 0;
      case 'engagement_rate':
        return impressions > 0 ? variant.metrics.engagement / impressions : 0;
      case 'revenue':
        return variant.metrics.revenue;
      case 'lift':
        const control = this.experiments.values()
          .flatMap(exp => exp.variants)
          .find(v => v.isControl && v.experimentId === variant.experimentId);
        if (control && control.metrics.impressions > 0) {
          const controlRate = control.metrics.conversions / control.metrics.impressions;
          const variantRate = variant.metrics.conversions / impressions;
          return this.calculateUplift(controlRate, variantRate);
        }
        return 0;
      default:
        return variant.metrics.conversions;
    }
  }

  private calculatePValue(controlConversions: number, controlSize: number, treatmentConversions: number, treatmentSize: number): number {
    const p1 = controlSize > 0 ? controlConversions / controlSize : 0;
    const p2 = treatmentSize > 0 ? treatmentConversions / treatmentSize : 0;
    const pooled = (controlConversions + treatmentConversions) / (controlSize + treatmentSize);
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / controlSize + 1 / treatmentSize));
    const z = se > 0 ? (p2 - p1) / se : 0;
    return this.normalCDF(z);
  }

  private normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1.0 + sign * y);
  }

  private calculateConfidenceInterval(proportion: number, n: number, confidence: number = 0.95): { lower: number; upper: number } {
    if (n < 2) {
      return { lower: proportion, upper: proportion };
    }
    const zScores: Record<number, number> = { 0.90: 1.645, 0.95: 1.96, 0.99: 2.576 };
    const z = zScores[confidence] || 1.96;
    const se = Math.sqrt((proportion * (1 - proportion)) / n);
    const margin = z * se;
    return {
      lower: Math.max(0, proportion - margin),
      upper: Math.min(1, proportion + margin),
    };
  }

  private calculateUplift(baseline: number, variant: number): number {
    if (baseline === 0) {
      return variant > 0 ? 100 : 0;
    }
    return ((variant - baseline) / baseline) * 100;
  }

  private generateExperimentId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `exp-${timestamp}-${random}`;
  }

  destroy(): void {
    this.stopAutomation();
  }
}

export const personalizationExperimentAutomation = new PersonalizationExperimentAutomation();
export type { IPersonalizationExperimentAutomation } from '@/types/personalization';
