export type SecuritySeverity = 'critical' | 'high' | 'moderate' | 'low';

export type VulnerabilityType = 'dependency' | 'code' | 'secret' | 'configuration' | 'compliance';

export type SecurityAuditStatus = 'in_progress' | 'completed' | 'failed';

export type RemediationStatus = 'unassigned' | 'assigned' | 'in_progress' | 'resolved' | 'verified';

export interface SecurityVulnerability {
  id: string;
  auditId: string;
  type: VulnerabilityType;
  severity: SecuritySeverity;
  cveId?: string;
  title: string;
  description: string;
  affectedComponent: string;
  affectedVersion?: string;
  patchVersion?: string;
  discoveredAt: string;
  remediationStatus: RemediationStatus;
  assignedTo?: string;
  resolvedAt?: string;
  notes?: string;
}

export interface SecurityAudit {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: SecurityAuditStatus;
  vulnerabilitiesFound: number;
  vulnerabilitiesResolved: number;
  timeToFix?: number; // in hours
  issuesFound: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
  issuesResolved: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
  totalVulnerabilities: number;
  resolvedVulnerabilities: number;
  score: number; // 0-100
}

export interface SecurityComplianceCheck {
  id: string;
  auditId: string;
  category: 'OWASP' | 'GDPR' | 'security' | 'rbac' | 'mfa';
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  recommendation?: string;
}

export interface SecurityPolicy {
  id: string;
  type: 'password' | 'session' | 'mfa';
  name: string;
  description: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface SecurityScore {
  overall: number; // 0-100
  critical: number; // weighted score (40%)
  high: number; // weighted score (30%)
  moderate: number; // weighted score (20%)
  low: number; // weighted score (10%)
  vulnerabilityCount: number;
  complianceRate: number; // percentage of passed checks
  lastAuditDate: string;
}

export interface SecurityMetrics {
  vulnerabilityTrends: {
    date: string;
    critical: number;
    high: number;
    moderate: number;
    low: number;
  }[];
  fixRates: {
    severity: SecuritySeverity;
    resolved: number;
    total: number;
    rate: number; // percentage
  }[];
  complianceHistory: {
    date: string;
    passRate: number; // percentage
  }[];
  averageTimeToFix: {
    severity: SecuritySeverity;
    avgHours: number;
  }[];
}

export interface ISecurityAuditScanner {
  runAudit(): Promise<SecurityAudit>;
  scanDependencies(): Promise<SecurityVulnerability[]>;
  scanCode(): Promise<SecurityVulnerability[]>;
  scanSecrets(): Promise<SecurityVulnerability[]>;
  checkCompliance(): Promise<SecurityComplianceCheck[]>;
  calculateScore(vulnerabilities: SecurityVulnerability[]): number;
  getAuditHistory(): SecurityAudit[];
  getVulnerabilities(auditId?: string): SecurityVulnerability[];
  assignVulnerability(vulnerabilityId: string, assignedTo: string): void;
  resolveVulnerability(vulnerabilityId: string, notes?: string): void;
  verifyFix(vulnerabilityId: string): void;
  getSecurityScore(): SecurityScore;
  getSecurityMetrics(): SecurityMetrics;
}
