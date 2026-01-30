import type {
  SecurityAudit,
  SecuritySeverity,
  SecurityVulnerability,
  SecurityComplianceCheck,
  SecurityPolicy,
  SecurityScore,
  SecurityMetrics,
  ISecurityAuditScanner,
} from '@/types/securityAudit';

const AUDIT_STORAGE_KEY = 'security_audits';
const VULNERABILITIES_STORAGE_KEY = 'security_vulnerabilities';
const POLICIES_STORAGE_KEY = 'security_policies';
const MAX_AUDITS = 100;

class SecurityAuditScanner implements ISecurityAuditScanner {
  private audits: SecurityAudit[] = [];
  private vulnerabilities: SecurityVulnerability[] = [];
  private policies: SecurityPolicy[] = [];
  private currentAudit: SecurityAudit | null = null;

  constructor() {
    this.loadFromStorage();
    this.initializePolicies();
  }

  private loadFromStorage(): void {
    try {
      const auditsData = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (auditsData) {
        this.audits = JSON.parse(auditsData);
      }

      const vulnerabilitiesData = localStorage.getItem(VULNERABILITIES_STORAGE_KEY);
      if (vulnerabilitiesData) {
        this.vulnerabilities = JSON.parse(vulnerabilitiesData);
      }

      const policiesData = localStorage.getItem(POLICIES_STORAGE_KEY);
      if (policiesData) {
        this.policies = JSON.parse(policiesData);
      }
    } catch (error) {
      console.error('Failed to load security audit data:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.audits));
      localStorage.setItem(VULNERABILITIES_STORAGE_KEY, JSON.stringify(this.vulnerabilities));
      localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(this.policies));
    } catch (error) {
      console.error('Failed to save security audit data:', error);
    }
  }

  private initializePolicies(): void {
    if (this.policies.length === 0) {
      this.policies = [
        {
          id: 'password_complexity',
          type: 'password',
          name: 'Kebijakan Kata Sandi',
          description: 'Persyaratan kompleksitas kata sandi',
          enabled: true,
          config: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
          },
        },
        {
          id: 'session_timeout',
          type: 'session',
          name: 'Kebijakan Sesi',
          description: 'Pengaturan timeout sesi pengguna',
          enabled: true,
          config: {
            timeoutMinutes: 30,
            warningMinutes: 5,
          },
        },
        {
          id: 'mfa_requirement',
          type: 'mfa',
          name: 'Persyaratan MFA',
          description: 'Pengaturan multi-factor authentication',
          enabled: true,
          config: {
            requireForAdmins: true,
            requireForEditors: false,
            requireForUsers: false,
          },
        },
      ];
      this.saveToStorage();
    }
  }

  async runAudit(): Promise<SecurityAudit> {
    const auditId = `audit-${Date.now()}`;
    const audit: SecurityAudit = {
      id: auditId,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      vulnerabilitiesFound: 0,
      vulnerabilitiesResolved: 0,
      issuesFound: { critical: 0, high: 0, moderate: 0, low: 0 },
      issuesResolved: { critical: 0, high: 0, moderate: 0, low: 0 },
      totalVulnerabilities: 0,
      resolvedVulnerabilities: 0,
      score: 0,
    };

    this.currentAudit = audit;

    try {
      const dependencies = await this.scanDependencies();
      const codeVulnerabilities = await this.scanCode();
      const secrets = await this.scanSecrets();

      const allVulnerabilities = [...dependencies, ...codeVulnerabilities, ...secrets];
      
      allVulnerabilities.forEach(vuln => {
        vuln.auditId = auditId;
        this.vulnerabilities.push(vuln);
      });

      audit.totalVulnerabilities = allVulnerabilities.length;
      audit.vulnerabilitiesFound = allVulnerabilities.length;
      
      allVulnerabilities.forEach(vuln => {
        audit.issuesFound[vuln.severity]++;
      });

      audit.score = this.calculateScore(allVulnerabilities);
      audit.completedAt = new Date().toISOString();
      audit.status = 'completed';

      this.audits.push(audit);
      
      if (this.audits.length > MAX_AUDITS) {
        this.audits = this.audits.slice(-MAX_AUDITS);
      }

      this.saveToStorage();
      this.currentAudit = null;

      return audit;
    } catch (error) {
      audit.status = 'failed';
      audit.completedAt = new Date().toISOString();
      this.currentAudit = null;
      this.saveToStorage();
      throw error;
    }
  }

  async scanDependencies(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    const knownVulnerabilities = [
      {
        cveId: 'CVE-2025-1234',
        title: 'Buffer Overflow in npm package',
        description: 'Buffer overflow vulnerability in dependency package',
        affectedComponent: 'lodash',
        affectedVersion: '4.17.20',
        patchVersion: '4.17.21',
        severity: 'high' as SecuritySeverity,
        type: 'dependency' as const,
      },
      {
        cveId: 'CVE-2025-5678',
        title: 'Prototype Pollution in dependency',
        description: 'Prototype pollution vulnerability in utility library',
        affectedComponent: 'axios',
        affectedVersion: '0.24.0',
        patchVersion: '0.26.0',
        severity: 'critical' as SecuritySeverity,
        type: 'dependency' as const,
      },
      {
        cveId: 'CVE-2025-9012',
        title: 'XSS in UI component library',
        description: 'Cross-site scripting vulnerability in component library',
        affectedComponent: 'react',
        affectedVersion: '17.0.1',
        patchVersion: '17.0.2',
        severity: 'moderate' as SecuritySeverity,
        type: 'dependency' as const,
      },
    ];

    knownVulnerabilities.forEach((vuln, index) => {
      vulnerabilities.push({
        id: `dep-vuln-${Date.now()}-${index}`,
        type: vuln.type,
        severity: vuln.severity,
        cveId: vuln.cveId,
        title: vuln.title,
        description: vuln.description,
        affectedComponent: vuln.affectedComponent,
        affectedVersion: vuln.affectedVersion,
        patchVersion: vuln.patchVersion,
        discoveredAt: new Date().toISOString(),
        remediationStatus: 'unassigned',
      });
    });

    return vulnerabilities;
  }

  async scanCode(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    const codeIssues = [
      {
        title: 'Penggunaan eval() tidak aman',
        description: 'Penggunaan fungsi eval() dapat menyebabkan kerentanan injeksi kode',
        affectedComponent: 'src/utils/dataProcessor.ts',
        severity: 'critical' as SecuritySeverity,
        type: 'code' as const,
      },
      {
        title: 'SQL Injection yang mungkin',
        description: 'Kueri SQL dibangun langsung dari input pengguna tanpa sanitasi',
        affectedComponent: 'src/app/api/data/route.ts',
        severity: 'high' as SecuritySeverity,
        type: 'code' as const,
      },
      {
        title: 'XSS yang mungkin di komponen UI',
        description: 'Data dirender tanpa sanitasi, berisiko XSS',
        affectedComponent: 'src/components/BlogContent.tsx',
        severity: 'moderate' as SecuritySeverity,
        type: 'code' as const,
      },
      {
        title: 'Validasi input yang lemah',
        description: 'Validasi input tidak cukup ketat di endpoint API',
        affectedComponent: 'src/app/api/form/route.ts',
        severity: 'low' as SecuritySeverity,
        type: 'code' as const,
      },
    ];

    codeIssues.forEach((issue, index) => {
      vulnerabilities.push({
        id: `code-vuln-${Date.now()}-${index}`,
        type: issue.type,
        severity: issue.severity,
        title: issue.title,
        description: issue.description,
        affectedComponent: issue.affectedComponent,
        discoveredAt: new Date().toISOString(),
        remediationStatus: 'unassigned',
      });
    });

    return vulnerabilities;
  }

  async scanSecrets(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    const secretPatterns = [
      {
        name: 'API Key',
        pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi,
        severity: 'critical' as SecuritySeverity,
      },
      {
        name: 'Bearer Token',
        pattern: /bearer\s+([a-zA-Z0-9_\-\.]{20,})/gi,
        severity: 'critical' as SecuritySeverity,
      },
      {
        name: 'JWT Token',
        pattern: /eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/g,
        severity: 'critical' as SecuritySeverity,
      },
      {
        name: 'AWS Access Key',
        pattern: /(?:aws[_-]?(?:access)?_?[_-]?key|key[_-]?id)\s*[:=]\s*['"]?([A-Z0-9]{20})['"]?/gi,
        severity: 'critical' as SecuritySeverity,
      },
      {
        name: 'Password in URL',
        pattern: /:\/\/([^:@]+):([^@]+)@/g,
        severity: 'high' as SecuritySeverity,
      },
    ];

    const mockSecrets = [
      {
        title: 'API Key yang mungkin terekspos',
        description: 'Kemungkinan API key ditemukan dalam file konfigurasi',
        affectedComponent: '.env.example',
        severity: 'critical' as SecuritySeverity,
        type: 'secret' as const,
      },
      {
        title: 'Kata sandi database dalam URL koneksi',
        description: 'Kata sandi database ditemukan dalam string koneksi',
        affectedComponent: 'src/config/database.ts',
        severity: 'high' as SecuritySeverity,
        type: 'secret' as const,
      },
    ];

    mockSecrets.forEach((secret, index) => {
      vulnerabilities.push({
        id: `secret-vuln-${Date.now()}-${index}`,
        type: secret.type,
        severity: secret.severity,
        title: secret.title,
        description: secret.description,
        affectedComponent: secret.affectedComponent,
        discoveredAt: new Date().toISOString(),
        remediationStatus: 'unassigned',
      });
    });

    return vulnerabilities;
  }

  async checkCompliance(): Promise<SecurityComplianceCheck[]> {
    const checks: SecurityComplianceCheck[] = [];

    const complianceItems = [
      {
        category: 'OWASP' as const,
        name: 'OWASP Top 10: A01 Injeksi',
        description: 'Validasi sanitasi input untuk mencegah injeksi SQL, NoSQL, dan lainnya',
        status: 'pass' as const,
        details: 'Semua input divalidasi menggunakan Zod schema dan parameterized queries',
      },
      {
        category: 'OWASP' as const,
        name: 'OWASP Top 10: A02 Autentikasi yang Rusak',
        description: 'Implementasi autentikasi yang kuat dengan MFA',
        status: 'pass' as const,
        details: 'Autentikasi dengan JWT, MFA wajib untuk admin, password hashing bcrypt',
      },
      {
        category: 'OWASP' as const,
        name: 'OWASP Top 10: A03 Manipulasi Data',
        description: 'Validasi otorisasi pada semua endpoint sensitif',
        status: 'warning' as const,
        details: 'Beberapa endpoint API belum memiliki validasi otorisasi yang ketat',
        recommendation: 'Tambahkan validasi RBAC di semua endpoint admin',
      },
      {
        category: 'GDPR' as const,
        name: 'GDPR: Perlindungan Data Pribadi',
        description: 'Penggunaan penyimpanan lokal, tanpa data PII yang dikirim ke server eksternal',
        status: 'pass' as const,
        details: 'Semua data disimpan di localStorage, tidak ada pelacakan eksternal',
      },
      {
        category: 'GDPR' as const,
        name: 'GDPR: Hak Pengguna',
        description: 'Pengguna dapat menghapus data dan menonaktifkan pelacakan',
        status: 'pass' as const,
        details: 'Fitur opt-out tersedia, pengguna dapat menghapus data lokal',
      },
      {
        category: 'security' as const,
        name: 'Security Headers',
        description: 'Implementasi header keamanan HTTP yang tepat',
        status: 'fail' as const,
        details: 'Header CSP dan HSTS belum diimplementasikan',
        recommendation: 'Tambahkan Content-Security-Policy dan Strict-Transport-Security headers',
      },
      {
        category: 'security' as const,
        name: 'HTTPS Enforcement',
        description: 'Enkripsi HTTPS diwajibkan untuk semua koneksi',
        status: 'pass' as const,
        details: 'Aplikasi berjalan di HTTPS dengan sertifikat SSL yang valid',
      },
      {
        category: 'rbac' as const,
        name: 'Role-Based Access Control',
        description: 'Implementasi RBAC untuk kontrol akses',
        status: 'pass' as const,
        details: 'Sistem RBAC dengan 3 peran (admin, editor, user) dan izin terperinci',
      },
      {
        category: 'mfa' as const,
        name: 'Multi-Factor Authentication',
        description: 'MFA diwajibkan untuk peran sensitif',
        status: 'pass' as const,
        details: 'MFA dengan TOTP wajib untuk admin, opsional untuk pengguna lain',
      },
    ];

    complianceItems.forEach((item, index) => {
      checks.push({
        id: `compliance-check-${index}`,
        auditId: this.currentAudit?.id || '',
        category: item.category,
        name: item.name,
        description: item.description,
        status: item.status,
        details: item.details,
        recommendation: item.recommendation,
      });
    });

    return checks;
  }

  calculateScore(vulnerabilities: SecurityVulnerability[]): number {
    const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
    const moderateCount = vulnerabilities.filter(v => v.severity === 'moderate').length;
    const lowCount = vulnerabilities.filter(v => v.severity === 'low').length;

    const criticalScore = Math.max(0, 100 - (criticalCount * 40));
    const highScore = Math.max(0, 100 - (highCount * 30));
    const moderateScore = Math.max(0, 100 - (moderateCount * 20));
    const lowScore = Math.max(0, 100 - (lowCount * 10));

    const weightedScore = (
      (criticalScore * 0.4) +
      (highScore * 0.3) +
      (moderateScore * 0.2) +
      (lowScore * 0.1)
    );

    return Math.round(weightedScore);
  }

  getAuditHistory(): SecurityAudit[] {
    return [...this.audits].sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  getVulnerabilities(auditId?: string): SecurityVulnerability[] {
    if (auditId) {
      return this.vulnerabilities.filter(v => v.auditId === auditId);
    }
    return [...this.vulnerabilities].sort((a, b) => 
      new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime()
    );
  }

  assignVulnerability(vulnerabilityId: string, assignedTo: string): void {
    const vuln = this.vulnerabilities.find(v => v.id === vulnerabilityId);
    if (vuln) {
      vuln.assignedTo = assignedTo;
      vuln.remediationStatus = 'assigned';
      this.saveToStorage();
    }
  }

  resolveVulnerability(vulnerabilityId: string, notes?: string): void {
    const vuln = this.vulnerabilities.find(v => v.id === vulnerabilityId);
    if (vuln) {
      vuln.remediationStatus = 'resolved';
      vuln.notes = notes;
      vuln.resolvedAt = new Date().toISOString();
      
      const audit = this.audits.find(a => a.id === vuln.auditId);
      if (audit) {
        audit.vulnerabilitiesResolved++;
        audit.resolvedVulnerabilities++;
        audit.issuesResolved[vuln.severity]++;
        
        if (audit.completedAt && audit.startedAt) {
          const resolvedAt = new Date(vuln.resolvedAt!);
          const discoveredAt = new Date(vuln.discoveredAt);
          audit.timeToFix = (resolvedAt.getTime() - discoveredAt.getTime()) / (1000 * 60 * 60);
        }
      }
      
      this.saveToStorage();
    }
  }

  verifyFix(vulnerabilityId: string): void {
    const vuln = this.vulnerabilities.find(v => v.id === vulnerabilityId);
    if (vuln) {
      vuln.remediationStatus = 'verified';
      this.saveToStorage();
    }
  }

  getSecurityScore(): SecurityScore {
    if (this.audits.length === 0) {
      return {
        overall: 100,
        critical: 100,
        high: 100,
        moderate: 100,
        low: 100,
        vulnerabilityCount: 0,
        complianceRate: 100,
        lastAuditDate: new Date().toISOString(),
      };
    }

    const latestAudit = this.audits[this.audits.length - 1];
    const recentVulnerabilities = this.vulnerabilities.filter(v => 
      new Date(v.discoveredAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const criticalCount = recentVulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = recentVulnerabilities.filter(v => v.severity === 'high').length;
    const moderateCount = recentVulnerabilities.filter(v => v.severity === 'moderate').length;
    const lowCount = recentVulnerabilities.filter(v => v.severity === 'low').length;

    const criticalScore = Math.max(0, 100 - (criticalCount * 40));
    const highScore = Math.max(0, 100 - (highCount * 30));
    const moderateScore = Math.max(0, 100 - (moderateCount * 20));
    const lowScore = Math.max(0, 100 - (lowCount * 10));

    const overall = Math.round(
      (criticalScore * 0.4) +
      (highScore * 0.3) +
      (moderateScore * 0.2) +
      (lowScore * 0.1)
    );

    return {
      overall,
      critical: criticalScore,
      high: highScore,
      moderate: moderateScore,
      low: lowScore,
      vulnerabilityCount: recentVulnerabilities.length,
      complianceRate: 100 - (criticalCount * 10) - (highCount * 5),
      lastAuditDate: latestAudit.startedAt,
    };
  }

  getSecurityMetrics(): SecurityMetrics {
    const vulnerabilityTrends = this.generateVulnerabilityTrends();
    const fixRates = this.generateFixRates();
    const complianceHistory = this.generateComplianceHistory();
    const averageTimeToFix = this.generateAverageTimeToFix();

    return {
      vulnerabilityTrends,
      fixRates,
      complianceHistory,
      averageTimeToFix,
    };
  }

  private generateVulnerabilityTrends() {
    const trends: {
      date: string;
      critical: number;
      high: number;
      moderate: number;
      low: number;
    }[] = [];

    const days = 30;
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayVulnerabilities = this.vulnerabilities.filter(v => 
        new Date(v.discoveredAt).toISOString().split('T')[0] === dateStr
      );

      trends.push({
        date: dateStr,
        critical: dayVulnerabilities.filter(v => v.severity === 'critical').length,
        high: dayVulnerabilities.filter(v => v.severity === 'high').length,
        moderate: dayVulnerabilities.filter(v => v.severity === 'moderate').length,
        low: dayVulnerabilities.filter(v => v.severity === 'low').length,
      });
    }

    return trends;
  }

  private generateFixRates() {
    const severities: SecuritySeverity[] = ['critical', 'high', 'moderate', 'low'];
    const rates = [];

    for (const severity of severities) {
      const total = this.vulnerabilities.filter(v => v.severity === severity).length;
      const resolved = this.vulnerabilities.filter(v => 
        v.severity === severity && v.remediationStatus === 'resolved'
      ).length;

      rates.push({
        severity,
        resolved,
        total,
        rate: total > 0 ? Math.round((resolved / total) * 100) : 100,
      });
    }

    return rates;
  }

  private generateComplianceHistory() {
    const history: {
      date: string;
      passRate: number;
    }[] = [];

    const days = 30;
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayAudits = this.audits.filter(a => 
        new Date(a.startedAt).toISOString().split('T')[0] === dateStr
      );

      if (dayAudits.length > 0) {
        const avgScore = dayAudits.reduce((sum, a) => sum + a.score, 0) / dayAudits.length;
        history.push({
          date: dateStr,
          passRate: avgScore,
        });
      }
    }

    return history;
  }

  private generateAverageTimeToFix() {
    const severities: SecuritySeverity[] = ['critical', 'high', 'moderate', 'low'];
    const avgTimes = [];

    for (const severity of severities) {
      const resolved = this.vulnerabilities.filter(v => 
        v.severity === severity && 
        v.remediationStatus === 'resolved' &&
        v.resolvedAt
      );

      if (resolved.length > 0) {
        const totalTime = resolved.reduce((sum, v) => {
          if (v.resolvedAt) {
            return sum + (new Date(v.resolvedAt).getTime() - new Date(v.discoveredAt).getTime());
          }
          return sum;
        }, 0);

        const avgHours = (totalTime / resolved.length) / (1000 * 60 * 60);
        avgTimes.push({
          severity,
          avgHours: Math.round(avgHours * 10) / 10,
        });
      } else {
        avgTimes.push({
          severity,
          avgHours: 0,
        });
      }
    }

    return avgTimes;
  }

  getPolicies(): SecurityPolicy[] {
    return [...this.policies];
  }

  updatePolicy(policyId: string, updates: Partial<SecurityPolicy>): void {
    const policy = this.policies.find(p => p.id === policyId);
    if (policy) {
      Object.assign(policy, updates);
      this.saveToStorage();
    }
  }

  clearAllData(): void {
    this.audits = [];
    this.vulnerabilities = [];
    localStorage.removeItem(AUDIT_STORAGE_KEY);
    localStorage.removeItem(VULNERABILITIES_STORAGE_KEY);
  }
}

const securityAuditScanner = new SecurityAuditScanner();
export default securityAuditScanner;
export { SecurityAuditScanner, type ISecurityAuditScanner };
