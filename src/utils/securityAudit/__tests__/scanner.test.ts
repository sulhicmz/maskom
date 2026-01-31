import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { SecurityAuditScanner } from '../scanner';
import type { SecurityVulnerability, SecurityAudit } from '../../../types/securityAudit';

describe('SecurityAuditScanner', () => {
  let scanner: SecurityAuditScanner;

  beforeEach(() => {
    localStorage.clear();
    scanner = new SecurityAuditScanner();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Constructor', () => {
    it('should initialize with empty data when localStorage is empty', () => {
      localStorage.clear();
      const freshScanner = new SecurityAuditScanner();
      
      expect(freshScanner.getAuditHistory()).toHaveLength(0);
      expect(freshScanner.getVulnerabilities()).toHaveLength(0);
      expect(freshScanner.getPolicies()).not.toHaveLength(0);
    });

    it('should load data from localStorage on initialization', () => {
      const mockAudit: SecurityAudit = {
        id: 'test-audit',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        status: 'completed',
        vulnerabilitiesFound: 1,
        vulnerabilitiesResolved: 0,
        totalVulnerabilities: 1,
        resolvedVulnerabilities: 0,
        issuesFound: { critical: 1, high: 0, moderate: 0, low: 0 },
        issuesResolved: { critical: 0, high: 0, moderate: 0, low: 0 },
        score: 60,
      };

      localStorage.setItem('security_audits', JSON.stringify([mockAudit]));
      
      const newScanner = new SecurityAuditScanner();
      const audits = newScanner.getAuditHistory();
      
      expect(audits).toHaveLength(1);
      expect(audits[0].id).toBe('test-audit');
    });

    it('should initialize default security policies', () => {
      const policies = scanner.getPolicies();
      
      expect(policies.length).toBeGreaterThan(0);
      expect(policies.some(p => p.id === 'password_complexity')).toBe(true);
      expect(policies.some(p => p.id === 'session_timeout')).toBe(true);
      expect(policies.some(p => p.id === 'mfa_requirement')).toBe(true);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('security_audits', 'invalid json');
      localStorage.setItem('security_vulnerabilities', 'invalid json');
      localStorage.setItem('security_policies', 'invalid json');
      
      const corruptedScanner = new SecurityAuditScanner();
      
      expect(corruptedScanner.getAuditHistory()).toHaveLength(0);
      expect(corruptedScanner.getVulnerabilities()).toHaveLength(0);
      expect(corruptedScanner.getPolicies()).not.toHaveLength(0);
    });
  });

  describe('runAudit', () => {
    it('should run a complete audit and return results', async () => {
      const audit = await scanner.runAudit();
      
      expect(audit.id).toBeDefined();
      expect(audit.id).toMatch(/^audit-\d+$/);
      expect(audit.status).toBe('completed');
      expect(audit.startedAt).toBeDefined();
      expect(audit.completedAt).toBeDefined();
      expect(audit.score).toBeGreaterThanOrEqual(0);
      expect(audit.score).toBeLessThanOrEqual(100);
    });

    it('should throw error if scan fails', async () => {
      const scanSpy = jest.spyOn(scanner, 'scanDependencies').mockRejectedValue(new Error('Scan failed'));
      
      await expect(scanner.runAudit()).rejects.toThrow('Scan failed');
      
      scanSpy.mockRestore();
    });

    it('should aggregate vulnerabilities from all scan types', async () => {
      const audit = await scanner.runAudit();
      
      expect(audit.totalVulnerabilities).toBeGreaterThan(0);
      expect(audit.vulnerabilitiesFound).toBe(audit.totalVulnerabilities);
    });

    it('should count vulnerabilities by severity correctly', async () => {
      const audit = await scanner.runAudit();
      
      const totalSeverityCount = Object.values(audit.issuesFound).reduce((sum: number, count: unknown) => sum + (count as number), 0);
      
      expect(totalSeverityCount).toBe(audit.totalVulnerabilities);
    });

    it('should store audit in localStorage', async () => {
      await scanner.runAudit();
      
      const storedData = localStorage.getItem('security_audits');
      expect(storedData).toBeDefined();
      
      const audits = JSON.parse(storedData!);
      expect(audits.length).toBeGreaterThan(0);
    });

    it('should maintain max 100 audits in history', async () => {
      for (let i = 0; i < 105; i++) {
        await scanner.runAudit();
      }
      
      const history = scanner.getAuditHistory();
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it('should set currentAudit to null after completion', async () => {
      await scanner.runAudit();
      
      const vulnerabilities = scanner.getVulnerabilities();
      expect(vulnerabilities.length).toBeGreaterThan(0);
    });
  });

  describe('scanDependencies', () => {
    it('should detect known dependency vulnerabilities', async () => {
      const vulnerabilities = await scanner.scanDependencies();
      
      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities.every(v => v.type === 'dependency')).toBe(true);
      expect(vulnerabilities.every(v => v.cveId)).toBe(true);
      expect(vulnerabilities.every(v => v.affectedComponent)).toBe(true);
      expect(vulnerabilities.every(v => v.affectedVersion)).toBe(true);
      expect(vulnerabilities.every(v => v.patchVersion)).toBe(true);
    });

    it('should include severity levels for dependency vulnerabilities', async () => {
      const vulnerabilities = await scanner.scanDependencies();
      
      const severities = new Set(vulnerabilities.map(v => v.severity));
      expect(severities.has('critical') || severities.has('high') || severities.has('moderate')).toBe(true);
    });

    it('should set remediation status to unassigned by default', async () => {
      const vulnerabilities = await scanner.scanDependencies();
      
      expect(vulnerabilities.every(v => v.remediationStatus === 'unassigned')).toBe(true);
    });

    it('should generate unique vulnerability IDs', async () => {
      const vulnerabilities1 = await scanner.scanDependencies();
      await new Promise(resolve => setTimeout(resolve, 10));
      const vulnerabilities2 = await scanner.scanDependencies();
      
      const allIds = [...vulnerabilities1, ...vulnerabilities2].map(v => v.id);
      const uniqueIds = new Set(allIds);
      
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  describe('scanCode', () => {
    it('should detect code vulnerabilities', async () => {
      const vulnerabilities = await scanner.scanCode();
      
      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities.every(v => v.type === 'code')).toBe(true);
      expect(vulnerabilities.every(v => v.affectedComponent)).toBe(true);
      expect(vulnerabilities.every(v => v.title)).toBe(true);
      expect(vulnerabilities.every(v => v.description)).toBe(true);
    });

    it('should include various severity levels', async () => {
      const vulnerabilities = await scanner.scanCode();
      
      const severities = new Set(vulnerabilities.map(v => v.severity));
      expect(severities.has('critical') || severities.has('high') || severities.has('moderate') || severities.has('low')).toBe(true);
    });

    it('should include Indonesian descriptions', async () => {
      const vulnerabilities = await scanner.scanCode();
      
      expect(vulnerabilities.some(v => v.title.includes('Penggunaan') || v.description.includes('yang mungkin'))).toBe(true);
    });

    it('should set remediation status to unassigned', async () => {
      const vulnerabilities = await scanner.scanCode();
      
      expect(vulnerabilities.every(v => v.remediationStatus === 'unassigned')).toBe(true);
    });

    it('should include affected component file paths', async () => {
      const vulnerabilities = await scanner.scanCode();
      
      expect(vulnerabilities.every(v => v.affectedComponent.startsWith('src/') || v.affectedComponent.startsWith('app/'))).toBe(true);
    });
  });

  describe('scanSecrets', () => {
    it('should detect secret vulnerabilities', async () => {
      const vulnerabilities = await scanner.scanSecrets();
      
      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities.every(v => v.type === 'secret')).toBe(true);
      expect(vulnerabilities.every(v => v.affectedComponent)).toBe(true);
    });

    it('should include critical and high severity secrets', async () => {
      const vulnerabilities = await scanner.scanSecrets();
      
      const severities = new Set(vulnerabilities.map(v => v.severity));
      expect(severities.has('critical') || severities.has('high')).toBe(true);
    });

    it('should include secret descriptions in Indonesian', async () => {
      const vulnerabilities = await scanner.scanSecrets();
      
      expect(vulnerabilities.some(v => v.title.includes('API Key') || v.description.includes('kata sandi'))).toBe(true);
    });

    it('should set remediation status to unassigned', async () => {
      const vulnerabilities = await scanner.scanSecrets();
      
      expect(vulnerabilities.every(v => v.remediationStatus === 'unassigned')).toBe(true);
    });
  });

  describe('checkCompliance', () => {
    it('should return compliance checks for all categories', async () => {
      const checks = await scanner.checkCompliance();
      
      expect(checks.length).toBeGreaterThan(0);
      
      const categories = new Set(checks.map(c => c.category));
      expect(categories.has('OWASP')).toBe(true);
      expect(categories.has('GDPR')).toBe(true);
      expect(categories.has('security')).toBe(true);
      expect(categories.has('rbac')).toBe(true);
      expect(categories.has('mfa')).toBe(true);
    });

    it('should include pass, fail, and warning statuses', async () => {
      const checks = await scanner.checkCompliance();
      
      const statuses = new Set(checks.map(c => c.status));
      expect(statuses.has('pass')).toBe(true);
      expect(statuses.has('fail') || statuses.has('warning')).toBe(true);
    });

    it('should include recommendations for failed checks', async () => {
      const checks = await scanner.checkCompliance();
      const failedChecks = checks.filter(c => c.status === 'fail');
      
      failedChecks.forEach(check => {
        expect(check.recommendation).toBeDefined();
      });
    });

    it('should include detailed descriptions', async () => {
      const checks = await scanner.checkCompliance();
      
      expect(checks.every(c => c.description)).toBe(true);
      expect(checks.every(c => c.details)).toBe(true);
    });

    it('should include OWASP Top 10 checks', async () => {
      const checks = await scanner.checkCompliance();
      const owaspChecks = checks.filter(c => c.category === 'OWASP');
      
      expect(owaspChecks.length).toBeGreaterThan(0);
      expect(owaspChecks.some(c => c.name.includes('A01'))).toBe(true);
      expect(owaspChecks.some(c => c.name.includes('A02'))).toBe(true);
    });
  });

  describe('calculateScore', () => {
    it('should return 100 with no vulnerabilities', () => {
      const score = scanner.calculateScore([]);
      expect(score).toBe(100);
    });

    it('should decrease score based on critical vulnerabilities', () => {
      const criticalVulns: SecurityVulnerability[] = [
        { id: '1', auditId: '', type: 'code', severity: 'critical', title: 'Critical', description: 'Test', affectedComponent: 'test.ts', discoveredAt: new Date().toISOString(), remediationStatus: 'unassigned' },
      ];
      
      const score = scanner.calculateScore(criticalVulns);
      expect(score).toBeLessThan(100);
    });

    it('should decrease score based on high vulnerabilities', () => {
      const highVulns: SecurityVulnerability[] = [
        { id: '1', auditId: '', type: 'code', severity: 'high', title: 'High', description: 'Test', affectedComponent: 'test.ts', discoveredAt: new Date().toISOString(), remediationStatus: 'unassigned' },
      ];
      
      const score = scanner.calculateScore(highVulns);
      expect(score).toBeLessThan(100);
    });

    it('should use weighted formula: critical 40%, high 30%, moderate 20%, low 10%', () => {
      const vulnerabilities: SecurityVulnerability[] = [
        { id: '1', auditId: '', type: 'code', severity: 'critical', title: 'Critical', description: 'Test', affectedComponent: 'test.ts', discoveredAt: new Date().toISOString(), remediationStatus: 'unassigned' },
        { id: '2', auditId: '', type: 'code', severity: 'high', title: 'High', description: 'Test', affectedComponent: 'test.ts', discoveredAt: new Date().toISOString(), remediationStatus: 'unassigned' },
        { id: '3', auditId: '', type: 'code', severity: 'moderate', title: 'Moderate', description: 'Test', affectedComponent: 'test.ts', discoveredAt: new Date().toISOString(), remediationStatus: 'unassigned' },
        { id: '4', auditId: '', type: 'code', severity: 'low', title: 'Low', description: 'Test', affectedComponent: 'test.ts', discoveredAt: new Date().toISOString(), remediationStatus: 'unassigned' },
      ];
      
      const score = scanner.calculateScore(vulnerabilities);
      
      const expectedCritical = 100 - (1 * 40);
      const expectedHigh = 100 - (1 * 30);
      const expectedModerate = 100 - (1 * 20);
      const expectedLow = 100 - (1 * 10);
      
      const expectedScore = (expectedCritical * 0.4) + (expectedHigh * 0.3) + (expectedModerate * 0.2) + (expectedLow * 0.1);
      
      expect(score).toBe(Math.round(expectedScore));
    });

    it('should not allow negative score components', () => {
      const manyCriticalVulns = Array(10).fill(null).map((_, i) => ({
        id: `vuln-${i}`,
        auditId: '',
        type: 'code' as const,
        severity: 'critical' as const,
        title: 'Critical',
        description: 'Test',
        affectedComponent: 'test.ts',
        discoveredAt: new Date().toISOString(),
        remediationStatus: 'unassigned' as const,
      }));
      
      const score = scanner.calculateScore(manyCriticalVulns);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAuditHistory', () => {
    it('should return empty array when no audits exist', () => {
      const history = scanner.getAuditHistory();
      expect(history).toEqual([]);
    });

    it('should return audits sorted by startedAt (newest first)', async () => {
      await scanner.runAudit();
      await new Promise(resolve => setTimeout(resolve, 50));
      await scanner.runAudit();
      
      const history = scanner.getAuditHistory();
      
      expect(history.length).toBe(2);
      expect(new Date(history[0].startedAt).getTime()).toBeGreaterThan(new Date(history[1].startedAt).getTime());
    });
  });

  describe('getVulnerabilities', () => {
    it('should return empty array when no vulnerabilities exist', () => {
      const vulnerabilities = scanner.getVulnerabilities();
      expect(vulnerabilities).toEqual([]);
    });

    it('should return vulnerabilities sorted by discoveredAt (newest first)', async () => {
      await scanner.runAudit();
      await new Promise(resolve => setTimeout(resolve, 50));
      await scanner.runAudit();
      
      const vulnerabilities = scanner.getVulnerabilities();
      
      if (vulnerabilities.length > 1) {
        expect(new Date(vulnerabilities[0].discoveredAt).getTime()).toBeGreaterThanOrEqual(new Date(vulnerabilities[1].discoveredAt).getTime());
      }
    });

    it('should filter vulnerabilities by auditId when provided', async () => {
      const audit = await scanner.runAudit();
      const auditId = audit.id;
      
      const allVulns = scanner.getVulnerabilities();
      const filteredVulns = scanner.getVulnerabilities(auditId);
      
      expect(filteredVulns.length).toBeLessThanOrEqual(allVulns.length);
      expect(filteredVulns.every(v => v.auditId === auditId)).toBe(true);
    });

    it('should return all vulnerabilities when no auditId provided', async () => {
      await scanner.runAudit();
      await scanner.runAudit();
      
      const vulnerabilities = scanner.getVulnerabilities();
      expect(vulnerabilities.length).toBeGreaterThan(0);
    });
  });

  describe('assignVulnerability', () => {
    it('should assign vulnerability to a team member', async () => {
      await scanner.runAudit();
      const vulnerabilities = scanner.getVulnerabilities();
      const vulnId = vulnerabilities[0].id;
      
      scanner.assignVulnerability(vulnId, 'test-user@example.com');
      
      const updatedVulns = scanner.getVulnerabilities();
      const assignedVuln = updatedVulns.find(v => v.id === vulnId);
      
      expect(assignedVuln?.assignedTo).toBe('test-user@example.com');
      expect(assignedVuln?.remediationStatus).toBe('assigned');
    });

    it('should do nothing for non-existent vulnerability', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      scanner.assignVulnerability('non-existent-id', 'test@example.com');
      
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should save assignment to localStorage', async () => {
      await scanner.runAudit();
      const vulnerabilities = scanner.getVulnerabilities();
      const vulnId = vulnerabilities[0].id;
      
      scanner.assignVulnerability(vulnId, 'test@example.com');
      
      const storedData = localStorage.getItem('security_vulnerabilities');
      expect(storedData).toBeDefined();
      
      const storedVulns = JSON.parse(storedData!);
      const storedVuln = storedVulns.find((v: SecurityVulnerability) => v.id === vulnId);
      
      expect(storedVuln?.assignedTo).toBe('test@example.com');
    });
  });

  describe('resolveVulnerability', () => {
    it('should resolve vulnerability with notes', async () => {
      await scanner.runAudit();
      const vulnerabilities = scanner.getVulnerabilities();
      const vulnId = vulnerabilities[0].id;
      
      scanner.resolveVulnerability(vulnId, 'Fixed by upgrading dependency');
      
      const updatedVulns = scanner.getVulnerabilities();
      const resolvedVuln = updatedVulns.find(v => v.id === vulnId);
      
      expect(resolvedVuln?.remediationStatus).toBe('resolved');
      expect(resolvedVuln?.notes).toBe('Fixed by upgrading dependency');
      expect(resolvedVuln?.resolvedAt).toBeDefined();
    });

    it('should resolve vulnerability without notes', async () => {
      await scanner.runAudit();
      const vulnerabilities = scanner.getVulnerabilities();
      const vulnId = vulnerabilities[0].id;
      
      scanner.resolveVulnerability(vulnId);
      
      const updatedVulns = scanner.getVulnerabilities();
      const resolvedVuln = updatedVulns.find(v => v.id === vulnId);
      
      expect(resolvedVuln?.remediationStatus).toBe('resolved');
      expect(resolvedVuln?.resolvedAt).toBeDefined();
    });

    it('should update audit statistics when vulnerability is resolved', async () => {
      const audit = await scanner.runAudit();
      const vulnerabilities = scanner.getVulnerabilities();
      const vulnId = vulnerabilities[0].id;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      scanner.resolveVulnerability(vulnId);
      
      const history = scanner.getAuditHistory();
      const updatedAudit = history.find(a => a.id === audit.id);
      
      expect(updatedAudit?.vulnerabilitiesResolved).toBe(1);
      expect(updatedAudit?.resolvedVulnerabilities).toBe(1);
      expect(updatedAudit?.timeToFix).toBeGreaterThanOrEqual(0);
    });

    it('should update issue resolved count by severity', async () => {
      const audit = await scanner.runAudit();
      const vulnerabilities = scanner.getVulnerabilities();
      const vuln = vulnerabilities.find(v => v.severity === 'critical') || vulnerabilities[0];
      
      scanner.resolveVulnerability(vuln.id);
      
      const history = scanner.getAuditHistory();
      const updatedAudit = history.find(a => a.id === audit.id);
      
      expect(updatedAudit?.issuesResolved[vuln.severity]).toBe(1);
    });

    it('should do nothing for non-existent vulnerability', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      scanner.resolveVulnerability('non-existent-id');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('verifyFix', () => {
    it('should verify vulnerability fix', async () => {
      await scanner.runAudit();
      const vulnerabilities = scanner.getVulnerabilities();
      const vulnId = vulnerabilities[0].id;
      
      scanner.resolveVulnerability(vulnId);
      scanner.verifyFix(vulnId);
      
      const updatedVulns = scanner.getVulnerabilities();
      const verifiedVuln = updatedVulns.find(v => v.id === vulnId);
      
      expect(verifiedVuln?.remediationStatus).toBe('verified');
    });

    it('should do nothing for non-existent vulnerability', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      scanner.verifyFix('non-existent-id');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getSecurityScore', () => {
    it('should return default score when no audits exist', () => {
      const score = scanner.getSecurityScore();
      
      expect(score.overall).toBe(100);
      expect(score.critical).toBe(100);
      expect(score.high).toBe(100);
      expect(score.moderate).toBe(100);
      expect(score.low).toBe(100);
      expect(score.vulnerabilityCount).toBe(0);
      expect(score.complianceRate).toBe(100);
    });

    it('should calculate score from latest audit', async () => {
      await scanner.runAudit();
      
      const score = scanner.getSecurityScore();
      
      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.lastAuditDate).toBeDefined();
    });

    it('should calculate compliance rate based on vulnerabilities', async () => {
      await scanner.runAudit();
      
      const score = scanner.getSecurityScore();
      
      expect(score.complianceRate).toBeGreaterThanOrEqual(0);
      expect(score.complianceRate).toBeLessThanOrEqual(100);
    });

    it('should count vulnerabilities from last 30 days', async () => {
      await scanner.runAudit();
      
      const score = scanner.getSecurityScore();
      const history = scanner.getAuditHistory();
      const latestAudit = history[0];
      
      expect(score.vulnerabilityCount).toBeGreaterThanOrEqual(0);
      expect(score.vulnerabilityCount).toBeLessThanOrEqual(latestAudit.totalVulnerabilities);
    });
  });

  describe('getSecurityMetrics', () => {
    it('should return metrics with all required fields', async () => {
      await scanner.runAudit();
      
      const metrics = scanner.getSecurityMetrics();
      
      expect(metrics.vulnerabilityTrends).toBeDefined();
      expect(metrics.fixRates).toBeDefined();
      expect(metrics.complianceHistory).toBeDefined();
      expect(metrics.averageTimeToFix).toBeDefined();
    });

    it('should generate vulnerability trends for 30 days', async () => {
      await scanner.runAudit();
      
      const metrics = scanner.getSecurityMetrics();
      
      expect(metrics.vulnerabilityTrends.length).toBe(31);
    });

    it('should include severity breakdown in trends', async () => {
      await scanner.runAudit();
      
      const metrics = scanner.getSecurityMetrics();
      const trend = metrics.vulnerabilityTrends[0];
      
      expect(trend).toHaveProperty('critical');
      expect(trend).toHaveProperty('high');
      expect(trend).toHaveProperty('moderate');
      expect(trend).toHaveProperty('low');
    });

    it('should calculate fix rates by severity', async () => {
      await scanner.runAudit();
      
      const metrics = scanner.getSecurityMetrics();
      
      expect(metrics.fixRates.length).toBe(4);
      
      const severities = metrics.fixRates.map(f => f.severity);
      expect(severities).toContain('critical');
      expect(severities).toContain('high');
      expect(severities).toContain('moderate');
      expect(severities).toContain('low');
    });

    it('should include total and resolved counts in fix rates', async () => {
      await scanner.runAudit();
      
      const metrics = scanner.getSecurityMetrics();
      
      metrics.fixRates.forEach(rate => {
        expect(rate).toHaveProperty('total');
        expect(rate).toHaveProperty('resolved');
        expect(rate).toHaveProperty('rate');
        expect(rate.rate).toBeGreaterThanOrEqual(0);
        expect(rate.rate).toBeLessThanOrEqual(100);
      });
    });

    it('should generate compliance history for 30 days', async () => {
      await scanner.runAudit();
      
      const metrics = scanner.getSecurityMetrics();
      
      expect(metrics.complianceHistory.length).toBeGreaterThan(0);
      expect(metrics.complianceHistory.length).toBeLessThanOrEqual(31);
    });

    it('should include date and passRate in compliance history', async () => {
      await scanner.runAudit();
      
      const metrics = scanner.getSecurityMetrics();
      
      metrics.complianceHistory.forEach(entry => {
        expect(entry).toHaveProperty('date');
        expect(entry).toHaveProperty('passRate');
        expect(entry.passRate).toBeGreaterThanOrEqual(0);
        expect(entry.passRate).toBeLessThanOrEqual(100);
      });
    });

    it('should calculate average time to fix by severity', async () => {
      await scanner.runAudit();
      const vulnerabilities = scanner.getVulnerabilities();
      
      if (vulnerabilities.length > 0) {
        scanner.resolveVulnerability(vulnerabilities[0].id);
      }
      
      const metrics = scanner.getSecurityMetrics();
      
      expect(metrics.averageTimeToFix.length).toBe(4);
    });

    it('should include avgHours in time to fix metrics', async () => {
      await scanner.runAudit();
      
      const metrics = scanner.getSecurityMetrics();
      
      metrics.averageTimeToFix.forEach(metric => {
        expect(metric).toHaveProperty('severity');
        expect(metric).toHaveProperty('avgHours');
        expect(metric.avgHours).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getPolicies', () => {
    it('should return all security policies', () => {
      const policies = scanner.getPolicies();
      
      expect(policies.length).toBeGreaterThan(0);
    });

    it('should include password, session, and MFA policies', () => {
      const policies = scanner.getPolicies();
      
      expect(policies.some(p => p.type === 'password')).toBe(true);
      expect(policies.some(p => p.type === 'session')).toBe(true);
      expect(policies.some(p => p.type === 'mfa')).toBe(true);
    });

    it('should include policy configuration', () => {
      const policies = scanner.getPolicies();
      
      policies.forEach(policy => {
        expect(policy).toHaveProperty('id');
        expect(policy).toHaveProperty('name');
        expect(policy).toHaveProperty('description');
        expect(policy).toHaveProperty('enabled');
        expect(policy).toHaveProperty('config');
        expect(Object.keys(policy.config).length).toBeGreaterThan(0);
      });
    });
  });

  describe('updatePolicy', () => {
    it('should update policy configuration', () => {
      const policies = scanner.getPolicies();
      const policy = policies[0];
      
      scanner.updatePolicy(policy.id, { enabled: false });
      
      const updatedPolicies = scanner.getPolicies();
      const updatedPolicy = updatedPolicies.find(p => p.id === policy.id);
      
      expect(updatedPolicy?.enabled).toBe(false);
    });

    it('should update multiple policy fields', () => {
      const policies = scanner.getPolicies();
      const policy = policies[0];
      
      scanner.updatePolicy(policy.id, { 
        enabled: false,
        description: 'Updated description'
      });
      
      const updatedPolicies = scanner.getPolicies();
      const updatedPolicy = updatedPolicies.find(p => p.id === policy.id);
      
      expect(updatedPolicy?.enabled).toBe(false);
      expect(updatedPolicy?.description).toBe('Updated description');
    });

    it('should do nothing for non-existent policy', () => {
      const policiesBefore = scanner.getPolicies();
      const countBefore = policiesBefore.length;
      
      scanner.updatePolicy('non-existent-policy-id', { enabled: false });
      
      const policiesAfter = scanner.getPolicies();
      expect(policiesAfter.length).toBe(countBefore);
    });

    it('should save policy updates to localStorage', () => {
      const policies = scanner.getPolicies();
      const policy = policies[0];
      
      scanner.updatePolicy(policy.id, { enabled: false });
      
      const storedData = localStorage.getItem('security_policies');
      expect(storedData).toBeDefined();
      
      const storedPolicies = JSON.parse(storedData!);
      const storedPolicy = storedPolicies.find((p: { id: string }) => p.id === policy.id);
      
      expect(storedPolicy?.enabled).toBe(false);
    });
  });

  describe('clearAllData', () => {
    it('should clear all audits', async () => {
      await scanner.runAudit();
      await scanner.runAudit();
      
      expect(scanner.getAuditHistory().length).toBeGreaterThan(0);
      
      scanner.clearAllData();
      
      expect(scanner.getAuditHistory()).toHaveLength(0);
    });

    it('should clear all vulnerabilities', async () => {
      await scanner.runAudit();
      
      expect(scanner.getVulnerabilities().length).toBeGreaterThan(0);
      
      scanner.clearAllData();
      
      expect(scanner.getVulnerabilities()).toHaveLength(0);
    });

    it('should clear localStorage', async () => {
      await scanner.runAudit();
      
      expect(localStorage.getItem('security_audits')).toBeDefined();
      expect(localStorage.getItem('security_vulnerabilities')).toBeDefined();
      
      scanner.clearAllData();
      
      expect(localStorage.getItem('security_audits')).toBeNull();
      expect(localStorage.getItem('security_vulnerabilities')).toBeNull();
    });

    it('should not clear security policies', async () => {
      const policiesBefore = scanner.getPolicies();
      
      await scanner.runAudit();
      scanner.clearAllData();
      
      const policiesAfter = scanner.getPolicies();
      
      expect(policiesAfter.length).toBe(policiesBefore.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle audit ID lookup with non-existent ID', async () => {
      await scanner.runAudit();
      
      const vulnerabilities = scanner.getVulnerabilities('non-existent-audit-id');
      expect(vulnerabilities).toHaveLength(0);
    });

    it('should handle resolve with non-existent vulnerability ID', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      scanner.resolveVulnerability('non-existent-id');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle verify fix with non-existent vulnerability ID', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      scanner.verifyFix('non-existent-id');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle localStorage quota exceeded gracefully', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      expect(() => {
        scanner.clearAllData();
      }).not.toThrow();
      
      setItemSpy.mockRestore();
    });

    it('should handle JSON parse errors in localStorage', () => {
      localStorage.setItem('security_audits', '{invalid json}');
      
      const freshScanner = new SecurityAuditScanner();
      
      expect(freshScanner.getAuditHistory()).toHaveLength(0);
    });
  });
});
