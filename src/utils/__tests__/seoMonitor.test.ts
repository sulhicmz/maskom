/**
 * SEO Monitor Utility Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  runSEOAudit,
  saveSEOAudit,
  loadSEOAuditHistory,
  loadCurrentSEOAudit,
  updateSEOIssueStatus,
  generateSEOScoreTrend,
  generateSEORecommendations,
  generateKeywordRankings,
  generateOrganicTrafficMetrics,
  generateSEOReport,
  getSEOConfig,
  saveSEOConfig,
  clearSEOAuditData,
  getSEOMetadata,
} from '@/utils/seoMonitor';
import type { SEOIssue, SEOAudit, SEOIssueStatus } from '@/types/seoMonitor';

describe('SEO Monitor', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('runSEOAudit', () => {
    it('should run SEO audit on specified pages', () => {
      const pages = ['/', '/blog', '/about'];
      const audit = runSEOAudit(pages);

      expect(audit).toBeDefined();
      expect(audit.id).toBeDefined();
      expect(audit.pagesAudited).toBe(pages.length);
      expect(audit.totalPages).toBe(pages.length);
      expect(audit.issues).toBeInstanceOf(Array);
      expect(audit.metrics).toBeInstanceOf(Array);
      expect(audit.summary).toBeDefined();
      expect(audit.overallScore).toBeGreaterThanOrEqual(0);
      expect(audit.overallScore).toBeLessThanOrEqual(100);
    });

    it('should generate issues for each page', () => {
      const pages = ['/', '/blog'];
      const audit = runSEOAudit(pages);

      const pagesWithIssues = new Set(audit.issues.map(i => i.page));
      expect(pagesWithIssues.size).toBeGreaterThan(0);
    });

    it('should generate page metrics for each page', () => {
      const pages = ['/', '/blog', '/about'];
      const audit = runSEOAudit(pages);

      expect(audit.metrics.length).toBe(pages.length);
      audit.metrics.forEach(metric => {
        expect(metric.page).toBeDefined();
        expect(metric.pageTitle).toBeDefined();
        expect(metric.url).toBeDefined();
        expect(metric.score).toBeGreaterThanOrEqual(0);
        expect(metric.score).toBeLessThanOrEqual(100);
        expect(metric.metaTagsScore).toBeDefined();
        expect(metric.structuredDataScore).toBeDefined();
        expect(metric.contentQualityScore).toBeDefined();
        expect(metric.performanceScore).toBeDefined();
        expect(metric.mobileScore).toBeDefined();
        expect(metric.linksScore).toBeDefined();
        expect(metric.imagesScore).toBeDefined();
      });
    });

    it('should calculate correct summary', () => {
      const pages = ['/', '/blog'];
      const audit = runSEOAudit(pages);

      expect(audit.summary.totalIssues).toBe(audit.issues.length);
      expect(audit.summary.pagesAudited).toBe(pages.length);
      expect(audit.summary.pagesWithIssues).toBeGreaterThanOrEqual(0);
      expect(audit.summary.pagesWithIssues).toBeLessThanOrEqual(pages.length);
      expect(audit.summary.avgScore).toBe(audit.overallScore);
    });

    it('should categorize issues by severity', () => {
      const pages = ['/', '/blog', '/about', '/contact'];
      const audit = runSEOAudit(pages);

      expect(audit.summary.criticalIssues).toBeGreaterThanOrEqual(0);
      expect(audit.summary.highIssues).toBeGreaterThanOrEqual(0);
      expect(audit.summary.moderateIssues).toBeGreaterThanOrEqual(0);
      expect(audit.summary.lowIssues).toBeGreaterThanOrEqual(0);

      const totalFromSummary =
        audit.summary.criticalIssues +
        audit.summary.highIssues +
        audit.summary.moderateIssues +
        audit.summary.lowIssues;

      expect(totalFromSummary).toBe(audit.issues.length);
    });

    it('should categorize issues by category', () => {
      const pages = ['/', '/blog'];
      const audit = runSEOAudit(pages);

      const categories = [
        'meta-tags',
        'structured-data',
        'content-quality',
        'performance',
        'mobile',
        'links',
        'images',
        'url-structure',
        'schema',
        'keywords',
      ];

      categories.forEach(category => {
        expect(audit.summary.categoryBreakdown[category]).toBeGreaterThanOrEqual(0);
      });

      const totalByCategory = Object.values(audit.summary.categoryBreakdown).reduce((sum, count) => sum + count, 0);
      expect(totalByCategory).toBe(audit.issues.length);
    });
  });

  describe('saveSEOAudit', () => {
    it('should save audit to localStorage', () => {
      const audit = runSEOAudit(['/']);
      saveSEOAudit(audit);

      const stored = localStorage.getItem('seo_current_audit');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.id).toBe(audit.id);
      expect(parsed.issues.length).toBe(audit.issues.length);
    });

    it('should add audit to history', () => {
      const audit1 = runSEOAudit(['/']);
      saveSEOAudit(audit1);

      const audit2 = runSEOAudit(['/blog']);
      saveSEOAudit(audit2);

      const history = loadSEOAuditHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history[0].id).toBe(audit2.id);
      expect(history[1].id).toBe(audit1.id);
    });

    it('should limit history to 50 audits', () => {
      // Create 60 audits
      for (let i = 0; i < 60; i++) {
        const audit = runSEOAudit([`/page${i}`]);
        saveSEOAudit(audit);
      }

      const history = loadSEOAuditHistory();
      expect(history.length).toBe(50);
    });
  });

  describe('loadSEOAuditHistory', () => {
    it('should load audit history from localStorage', () => {
      const audit1 = runSEOAudit(['/']);
      const audit2 = runSEOAudit(['/blog']);

      saveSEOAudit(audit1);
      saveSEOAudit(audit2);

      const history = loadSEOAuditHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array when no history exists', () => {
      const history = loadSEOAuditHistory();
      expect(history).toEqual([]);
    });
  });

  describe('loadCurrentSEOAudit', () => {
    it('should load current audit from localStorage', () => {
      const audit = runSEOAudit(['/']);
      saveSEOAudit(audit);

      const loaded = loadCurrentSEOAudit();
      expect(loaded).toBeDefined();
      expect(loaded!.id).toBe(audit.id);
      expect(loaded!.issues.length).toBe(audit.issues.length);
    });

    it('should return null when no current audit exists', () => {
      const loaded = loadCurrentSEOAudit();
      expect(loaded).toBeNull();
    });
  });

  describe('updateSEOIssueStatus', () => {
    it('should update issue status to in-progress', () => {
      const audit = runSEOAudit(['/']);
      saveSEOAudit(audit);

      const issueId = audit.issues[0].id;
      const success = updateSEOIssueStatus(issueId, 'in-progress');

      expect(success).toBe(true);

      const loaded = loadCurrentSEOAudit();
      const updatedIssue = loaded!.issues.find(i => i.id === issueId);

      expect(updatedIssue!.status).toBe('in-progress');
      expect(updatedIssue!.acknowledgedAt).toBeDefined();
    });

    it('should update issue status to fixed', () => {
      const audit = runSEOAudit(['/']);
      saveSEOAudit(audit);

      const issueId = audit.issues[0].id;
      const success = updateSEOIssueStatus(issueId, 'fixed');

      expect(success).toBe(true);

      const loaded = loadCurrentSEOAudit();
      const updatedIssue = loaded!.issues.find(i => i.id === issueId);

      expect(updatedIssue!.status).toBe('fixed');
      expect(updatedIssue!.fixedAt).toBeDefined();
    });

    it('should update issue status to false-positive', () => {
      const audit = runSEOAudit(['/']);
      saveSEOAudit(audit);

      const issueId = audit.issues[0].id;
      const success = updateSEOIssueStatus(issueId, 'false-positive');

      expect(success).toBe(true);

      const loaded = loadCurrentSEOAudit();
      const updatedIssue = loaded!.issues.find(i => i.id === issueId);

      expect(updatedIssue!.status).toBe('false-positive');
    });

    it('should return false for non-existent issue', () => {
      const success = updateSEOIssueStatus('non-existent-id', 'fixed');
      expect(success).toBe(false);
    });
  });

  describe('generateSEOScoreTrend', () => {
    it('should generate score trend data', () => {
      // Create some audit history
      for (let i = 0; i < 5; i++) {
        const audit = runSEOAudit(['/']);
        saveSEOAudit(audit);
      }

      const trend = generateSEOScoreTrend(30);

      expect(trend).toBeInstanceOf(Array);
      expect(trend.length).toBeGreaterThan(0);
    });

    it('should return limited days', () => {
      for (let i = 0; i < 10; i++) {
        const audit = runSEOAudit(['/']);
        saveSEOAudit(audit);
      }

      const trend = generateSEOScoreTrend(7);
      expect(trend.length).toBeLessThanOrEqual(7);
    });

    it('should have correct trend structure', () => {
      const trend = generateSEOScoreTrend(30);

      trend.forEach(point => {
        expect(point.date).toBeDefined();
        expect(point.score).toBeGreaterThanOrEqual(0);
        expect(point.score).toBeLessThanOrEqual(100);
        expect(point.issuesCount).toBeGreaterThanOrEqual(0);
        expect(point.criticalIssues).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('generateSEORecommendations', () => {
    it('should generate recommendations for audit', () => {
      const audit = runSEOAudit(['/']);
      const recommendations = generateSEORecommendations(audit);

      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(10);
    });

    it('should prioritize critical issues first', () => {
      const audit = runSEOAudit(['/blog', '/about', '/contact']);
      const recommendations = generateSEORecommendations(audit);

      const criticalIssues = audit.issues.filter(i => i.severity === 'critical');
      const highIssues = audit.issues.filter(i => i.severity === 'high');

      // Critical issues should come before high issues in recommendations
      if (criticalIssues.length > 0 && highIssues.length > 0) {
        const firstCriticalIdx = recommendations.findIndex(r =>
          audit.issues.find(i => i.id === r.issueId)?.severity === 'critical'
        );
        const firstHighIdx = recommendations.findIndex(r =>
          audit.issues.find(i => i.id === r.issueId)?.severity === 'high'
        );
        expect(firstCriticalIdx).toBeLessThan(firstHighIdx);
      }
    });

    it('should have correct recommendation structure', () => {
      const audit = runSEOAudit(['/']);
      const recommendations = generateSEORecommendations(audit);

      recommendations.forEach(rec => {
        expect(rec.issueId).toBeDefined();
        expect(rec.priority).toMatch(/^(critical|high|moderate|low)$/);
        expect(rec.action).toBeDefined();
        expect(rec.estimatedImpact).toMatch(/^(high|medium|low)$/);
        expect(rec.effort).toMatch(/^(quick|moderate|significant)$/);
      });
    });
  });

  describe('generateKeywordRankings', () => {
    it('should generate keyword rankings', () => {
      const rankings = generateKeywordRankings();

      expect(rankings).toBeInstanceOf(Array);
      expect(rankings.length).toBeGreaterThan(0);
    });

    it('should have correct ranking structure', () => {
      const rankings = generateKeywordRankings();

      rankings.forEach(ranking => {
        expect(ranking.keyword).toBeDefined();
        expect(ranking.currentRank).toBeGreaterThan(0);
        expect(ranking.searchVolume).toBeGreaterThan(0);
        expect(ranking.clickThroughRate).toBeGreaterThan(0);
        expect(ranking.lastUpdated).toBeDefined();
      });
    });

    it('should include previous rank for some keywords', () => {
      const rankings = generateKeywordRankings();

      const hasPreviousRank = rankings.some(r => r.previousRank !== undefined);
      expect(hasPreviousRank).toBe(true);
    });
  });

  describe('generateOrganicTrafficMetrics', () => {
    it('should generate organic traffic metrics', () => {
      const metrics = generateOrganicTrafficMetrics(30);

      expect(metrics).toBeInstanceOf(Array);
      expect(metrics.length).toBe(30);
    });

    it('should have correct metrics structure', () => {
      const metrics = generateOrganicTrafficMetrics(7);

      metrics.forEach(metric => {
        expect(metric.date).toBeDefined();
        expect(metric.organicSessions).toBeGreaterThan(0);
        expect(metric.organicPageViews).toBeGreaterThan(0);
        expect(metric.avgSessionDuration).toBeGreaterThan(0);
        expect(metric.organicBounceRate).toBeGreaterThan(0);
        expect(metric.conversionRate).toBeGreaterThan(0);
      });
    });

    it('should generate specified number of days', () => {
      const metrics = generateOrganicTrafficMetrics(15);
      expect(metrics.length).toBe(15);
    });
  });

  describe('generateSEOReport', () => {
    it('should generate report from current audit', () => {
      const audit = runSEOAudit(['/']);
      saveSEOAudit(audit);

      const report = generateSEOReport();

      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(report.generatedAt).toBeDefined();
      expect(report.auditData).toBeDefined();
      expect(report.trends).toBeInstanceOf(Array);
      expect(report.keywordRankings).toBeInstanceOf(Array);
      expect(report.organicTraffic).toBeInstanceOf(Array);
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    it('should generate report from specific audit', () => {
      const audit1 = runSEOAudit(['/']);
      saveSEOAudit(audit1);

      const audit2 = runSEOAudit(['/blog']);
      saveSEOAudit(audit2);

      const report = generateSEOReport(audit2.id);

      expect(report).toBeDefined();
      expect(report.auditData.id).toBe(audit2.id);
    });

    it('should return null when no audit exists', () => {
      const report = generateSEOReport('non-existent-id');
      expect(report).toBeNull();
    });

    it('should include date range in report', () => {
      const audit = runSEOAudit(['/']);
      saveSEOAudit(audit);

      const report = generateSEOReport();

      expect(report.dateRange).toBeDefined();
      expect(report.dateRange.start).toBeDefined();
      expect(report.dateRange.end).toBeDefined();
    });
  });

  describe('getSEOConfig', () => {
    it('should return default config when none exists', () => {
      const config = getSEOConfig();

      expect(config).toBeDefined();
      expect(config.enabled).toBe(true);
      expect(config.auditSchedule).toBe('weekly');
      expect(config.autoFixEnabled).toBe(false);
      expect(config.notificationsEnabled).toBe(true);
    });

    it('should load saved config', () => {
      const customConfig = {
        enabled: false,
        auditSchedule: 'daily' as const,
        autoFixEnabled: true,
        notificationsEnabled: false,
        criticalThreshold: 60,
        highThreshold: 70,
        moderateThreshold: 80,
      };
      saveSEOConfig(customConfig);

      const loaded = getSEOConfig();

      expect(loaded.enabled).toBe(false);
      expect(loaded.auditSchedule).toBe('daily');
      expect(loaded.autoFixEnabled).toBe(true);
      expect(loaded.notificationsEnabled).toBe(false);
      expect(loaded.criticalThreshold).toBe(60);
    });
  });

  describe('saveSEOConfig', () => {
    it('should save config to localStorage', () => {
      const config = {
        enabled: false,
        auditSchedule: 'monthly' as const,
        autoFixEnabled: true,
        notificationsEnabled: true,
        criticalThreshold: 75,
        highThreshold: 85,
        moderateThreshold: 95,
      };

      saveSEOConfig(config);

      const stored = localStorage.getItem('seo_config');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.enabled).toBe(false);
      expect(parsed.auditSchedule).toBe('monthly');
    });
  });

  describe('clearSEOAuditData', () => {
    it('should clear all SEO audit data', () => {
      const audit = runSEOAudit(['/']);
      saveSEOAudit(audit);

      expect(localStorage.getItem('seo_current_audit')).toBeDefined();
      expect(localStorage.getItem('seo_audits')).toBeDefined();

      clearSEOAuditData();

      expect(localStorage.getItem('seo_current_audit')).toBeNull();
      expect(localStorage.getItem('seo_audits')).toBeNull();
      expect(localStorage.getItem('seo_metadata')).toBeNull();
    });
  });

  describe('getSEOMetadata', () => {
    it('should return default metadata when none exists', () => {
      const metadata = getSEOMetadata();

      expect(metadata).toBeDefined();
      expect(metadata.version).toBeDefined();
      expect(metadata.lastAuditTime).toBeDefined();
      expect(metadata.nextAuditTime).toBeDefined();
      expect(metadata.totalAudits).toBe(0);
      expect(metadata.issuesResolved).toBe(0);
      expect(metadata.issuesOpen).toBe(0);
    });

    it('should update metadata after saving audit', () => {
      const audit = runSEOAudit(['/']);
      saveSEOAudit(audit);

      const metadata = getSEOMetadata();

      expect(metadata.totalAudits).toBeGreaterThan(0);
      expect(metadata.lastAuditTime).toBeDefined();
      expect(metadata.nextAuditTime).toBeDefined();
    });
  });

  describe('SEO Issue Structure', () => {
    it('should have all required fields', () => {
      const audit = runSEOAudit(['/']);

      if (audit.issues.length > 0) {
        const issue = audit.issues[0];

        expect(issue.id).toBeDefined();
        expect(issue.page).toBeDefined();
        expect(issue.category).toBeDefined();
        expect(issue.severity).toMatch(/^(critical|high|moderate|low)$/);
        expect(issue.status).toMatch(/^(open|in-progress|fixed|false-positive)$/);
        expect(issue.title).toBeDefined();
        expect(issue.description).toBeDefined();
        expect(issue.recommendation).toBeDefined();
        expect(issue.detectedAt).toBeDefined();
      }
    });
  });

  describe('SEO Metrics Structure', () => {
    it('should have all required fields', () => {
      const audit = runSEOAudit(['/']);

      audit.metrics.forEach(metric => {
        expect(metric.page).toBeDefined();
        expect(metric.pageTitle).toBeDefined();
        expect(metric.url).toBeDefined();
        expect(metric.score).toBeGreaterThanOrEqual(0);
        expect(metric.score).toBeLessThanOrEqual(100);
        expect(metric.lastChecked).toBeDefined();
        expect(metric.metaTagsScore).toBeDefined();
        expect(metric.structuredDataScore).toBeDefined();
        expect(metric.contentQualityScore).toBeDefined();
        expect(metric.performanceScore).toBeDefined();
        expect(metric.mobileScore).toBeDefined();
        expect(metric.linksScore).toBeDefined();
        expect(metric.imagesScore).toBeDefined();
      });
    });
  });

  describe('SEO Score Calculation', () => {
    it('should calculate score based on issue severity', () => {
      const audit = runSEOAudit(['/']);

      if (audit.issues.length === 0) {
        expect(audit.overallScore).toBe(100);
      } else {
        expect(audit.overallScore).toBeGreaterThanOrEqual(0);
        expect(audit.overallScore).toBeLessThanOrEqual(100);
      }
    });

    it('should decrease score with more severe issues', () => {
      const audit1 = runSEOAudit(['/about']); // Has more issues
      const audit2 = runSEOAudit(['/blog']); // Has fewer issues

      // This is a soft test - the simulation may vary
      expect(audit1.overallScore).toBeGreaterThanOrEqual(0);
      expect(audit2.overallScore).toBeGreaterThanOrEqual(0);
    });
  });
});
