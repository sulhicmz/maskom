/**
 * Accessibility Audit Engine
 * 
 * Core engine for running accessibility audits using axe-core,
 * calculating scores, and managing audit results.
 */

import { AxeResults, run } from '@axe-core/react';
import type {
  AccessibilityAudit,
  AccessibilityIssue,
  AccessibilityScore,
  AccessibilitySummary,
  AccessibilityAuditMetadata,
  AccessibilitySeverity,
  AccessibilityIssueCategory,
} from '@/types/accessibility';
import { generateUUID } from '@/utils/uuid';

/**
 * Convert axe-core impact to our severity type
 */
export function mapAxeImpactToSeverity(impact: string | null): AccessibilitySeverity {
  if (!impact) return 'moderate';
  const impactMap: Record<string, AccessibilitySeverity> = {
    critical: 'critical',
    serious: 'serious',
    moderate: 'moderate',
    minor: 'minor',
  };
  return impactMap[impact] || 'moderate';
}

/**
 * Convert axe-core category to our issue category
 */
export function mapAxeTagsToCategory(tags: string[]): AccessibilityIssueCategory {
  if (tags.includes('wcag2a')) return 'wcag2a';
  if (tags.includes('wcag2aa')) return 'wcag2aa';
  if (tags.includes('wcag21aa')) return 'wcag21aa';
  if (tags.includes('best-practice')) return 'best-practice';
  
  const categoryMap: Record<string, AccessibilityIssueCategory> = {
    'aria': 'aria',
    'color': 'color',
    'form': 'forms',
    'keyboard': 'keyboard',
    'language': 'language',
    'label': 'labels',
    'name-role-value': 'name-role-value',
    'parsing': 'parsing',
    'reading': 'reading',
    'semantic': 'semantic-html',
    'table': 'tables',
    'timing': 'timing',
    'contrast': 'contrast',
    'image': 'images',
    'nav': 'navigation',
    'landmark': 'landmarks',
    'focus': 'focus',
  };
  
  for (const tag of tags) {
    if (categoryMap[tag]) return categoryMap[tag];
  }
  
  return 'semantic-html';
}

/**
 * Extract WCAG criteria from tags
 */
export function extractWcagCriteria(tags: string[]): string[] {
  return tags.filter(tag => tag.startsWith('wcag2'));
}

/**
 * Determine WCAG level from tags
 */
export function determineWcagLevel(tags: string[]): 'A' | 'AA' | 'AAA' {
  if (tags.includes('wcag21aa')) return 'AA';
  if (tags.includes('wcag2aa')) return 'AA';
  if (tags.includes('wcag2a')) return 'A';
  return 'AA';
}

/**
 * Convert axe-core result to our issue format
 */
function convertAxeResultToIssue(
  result: AxeResults['violations'][0]
): AccessibilityIssue {
  return {
    id: result.id,
    impact: mapAxeImpactToSeverity(result.impact),
    tags: result.tags,
    description: result.description,
    help: result.help,
    helpUrl: result.helpUrl,
    nodes: result.nodes.map(node => ({
      html: node.html,
      target: node.target || [],
      failureSummary: node.failureSummary || '',
      any: node.any || [],
      all: node.all || [],
      none: node.none || [],
    })),
    category: mapAxeTagsToCategory(result.tags),
    wcagLevel: determineWcagLevel(result.tags),
    wcagCriteria: extractWcagCriteria(result.tags),
    detectedAt: new Date().toISOString(),
    status: 'open',
  };
}

/**
 * Calculate accessibility score from audit results
 */
export function calculateScore(
  totalIssues: number,
  criticalIssues: number,
  seriousIssues: number,
  moderateIssues: number,
  minorIssues: number
): AccessibilityScore {
  // Weighted score calculation
  const criticalWeight = 10;
  const seriousWeight = 5;
  const moderateWeight = 2;
  const minorWeight = 1;
  
  const totalWeightedIssues =
    criticalIssues * criticalWeight +
    seriousIssues * seriousWeight +
    moderateIssues * moderateWeight +
    minorIssues * minorWeight;
  
  // Base score starts at 100, decreases based on issues
  const score = Math.max(0, 100 - (totalWeightedIssues * 0.5));
  
  // Calculate WCAG 2.1 AA compliance rate
  // Assuming a standard baseline of 100 checkpoints
  const wcag21aaCompliance = Math.max(0, 100 - (criticalIssues * 10) - (seriousIssues * 5));
  
  return {
    overall: Math.round(score),
    bySeverity: {
      critical: criticalIssues,
      serious: seriousIssues,
      moderate: moderateIssues,
      minor: minorIssues,
    },
    byCategory: {
      aria: 0,
      color: 0,
      forms: 0,
      keyboard: 0,
      language: 0,
      labels: 0,
      'name-role-value': 0,
      parsing: 0,
      reading: 0,
      'semantic-html': 0,
      tables: 0,
      timing: 0,
      contrast: 0,
      images: 0,
      navigation: 0,
      landmarks: 0,
      focus: 0,
      wcag2a: 0,
      wcag2aa: 0,
      wcag21aa: 0,
      'best-practice': 0,
    },
    wcag21aaCompliance: Math.round(wcag21aaCompliance),
  };
}

/**
 * Create audit summary
 */
export function createSummary(violations: AccessibilityIssue[]): AccessibilitySummary {
  const summary: AccessibilitySummary = {
    total: 0,
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    passed: 0,
    incomplete: 0,
  };
  
  for (const issue of violations) {
    if (issue.status === 'false-positive' || issue.status === 'cannot-reproduce') {
      continue;
    }
    
    summary.total++;
    
    switch (issue.impact) {
      case 'critical':
        summary.critical++;
        break;
      case 'serious':
        summary.serious++;
        break;
      case 'moderate':
        summary.moderate++;
        break;
      case 'minor':
        summary.minor++;
        break;
    }
  }
  
  return summary;
}

/**
 * Get device type from viewport
 */
export function getDeviceType(width: number): 'desktop' | 'mobile' | 'tablet' {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Run accessibility audit on current page
 */
export async function runAccessibilityAudit(
  url: string,
  _context?: {
    include?: string[];
    exclude?: string[];
  }
): Promise<AccessibilityAudit> {
  const startTime = Date.now();
  
  // Run axe-core
  const axeResults: AxeResults = await run(document);
  
  const auditDuration = Date.now() - startTime;
  
  // Convert violations to our format
  const issues: AccessibilityIssue[] = axeResults.violations.map(convertAxeResultToIssue);
  
  // Calculate summary
  const summary = createSummary(issues);
  
  // Calculate score
  const score = calculateScore(
    summary.total,
    summary.critical,
    summary.serious,
    summary.moderate,
    summary.minor
  );
  
  // Populate byCategory count
  for (const issue of issues) {
    score.byCategory[issue.category] = (score.byCategory[issue.category] || 0) + 1;
  }
  
  // Create metadata
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  
  const metadata: AccessibilityAuditMetadata = {
    userAgent: navigator.userAgent,
    viewport,
    deviceType: getDeviceType(viewport.width),
    auditDuration,
    tags: ['production', 'automated'],
  };
  
  // Return audit
  const audit: AccessibilityAudit = {
    id: generateUUID(),
    url,
    timestamp: new Date().toISOString(),
    issues,
    score,
    summary,
    metadata,
  };
  
  return audit;
}

/**
 * Calculate score improvement between two audits
 */
export function calculateScoreImprovement(
  oldScore: AccessibilityScore,
  newScore: AccessibilityScore
): number {
  return newScore.overall - oldScore.overall;
}

/**
 * Get high-priority issues (critical or serious)
 */
export function getHighPriorityIssues(
  issues: AccessibilityIssue[]
): AccessibilityIssue[] {
  return issues.filter(issue => 
    (issue.impact === 'critical' || issue.impact === 'serious') &&
    issue.status !== 'false-positive' &&
    issue.status !== 'cannot-reproduce'
  );
}

/**
 * Get WCAG 2.1 AA compliance percentage
 */
export function getWcag21aaCompliance(score: AccessibilityScore): number {
  return score.wcag21aaCompliance;
}

/**
 * Check if audit meets minimum compliance threshold
 */
export function meetsComplianceThreshold(
  audit: AccessibilityAudit,
  threshold: number = 90
): boolean {
  return audit.score.wcag21aaCompliance >= threshold;
}

/**
 * Get audit score trend
 */
export function getScoreTrend(
  scores: AccessibilityScoreTrend[]
): 'improving' | 'stable' | 'degrading' {
  if (scores.length < 2) return 'stable';
  
  const recent = scores.slice(-5);
  const first = recent[0].score;
  const last = recent[recent.length - 1].score;
  
  if (last > first + 5) return 'improving';
  if (last < first - 5) return 'degrading';
  return 'stable';
}

export type { AccessibilityScoreTrend };
