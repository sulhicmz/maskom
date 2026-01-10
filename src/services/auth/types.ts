export interface IAuthService {
    login(credentials: LoginCredentials): Promise<AuthResult>;
    register(userData: RegisterData): Promise<AuthResult>;
    logout(): Promise<AuthResult>;
    getCurrentUser(): Promise<User | null>;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface AuthResult {
    success: boolean;
    message?: string;
    error?: string;
    user?: User;
    token?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}
