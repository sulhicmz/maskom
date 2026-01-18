import type { ServiceErrorCodeType } from '@/types/common';
import type { CircuitBreakerState } from '@/utils/resilience';
import type { UserRole } from '@/types/role';
import type { Permission } from '@/types/permission';
import type { MFAData, MFAStatus } from '@/types/mfa';

export interface IAuthService {
    login(credentials: LoginCredentials): Promise<AuthResult>;
    register(userData: RegisterData): Promise<AuthResult>;
    logout(): Promise<AuthResult>;
    getCurrentUser(): Promise<User | null>;
    getCurrentUserRole(): Promise<UserRole | null>;
    hasPermission(permission: Permission): Promise<boolean>;
    hasRole(role: UserRole): Promise<boolean>;
    getCircuitBreakerState(): CircuitBreakerState;
    resetCircuitBreaker(): void;
    enableMFA(totpCode: string): Promise<AuthResult>;
    disableMFA(password: string): Promise<AuthResult>;
    verifyMFA(totpCode: string, backupCode?: string): Promise<AuthResult>;
    getMFAStatus(): Promise<MFAStatus>;
    regenerateBackupCodes(password: string): Promise<AuthResult>;
    initiateMFASetup(): Promise<AuthResult>;
}

export interface LoginCredentials {
    email: string;
    password: string;
    totpCode?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface AuthResult {
    success: boolean;
    message?: string;
    error?: string;
    errorCode?: ServiceErrorCodeType;
    user?: User;
    token?: string;
    metadata?: Record<string, unknown>;
    mfaSetupData?: MFASetupData;
}

export interface MFASetupData {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    mfaEnabled: boolean;
    mfaSecret?: string;
    mfaBackupCodes?: string[];
    mfaEnabledAt?: string;
}
