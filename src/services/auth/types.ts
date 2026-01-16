import type { ServiceErrorCodeType } from '@/services/common';
import type { CircuitBreakerState } from '@/utils/resilience';
import type { UserRole } from '@/types/role';
import type { Permission } from '@/types/permission';

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
}

export interface LoginCredentials {
    email: string;
    password: string;
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
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}
