import { InjectionToken } from '@angular/core';

export type AuthModuleConfig = {
    apiBaseUrl: string;                 // ex: https://api.example.com
    endpoints?: {
        login?: string;                   // défaut: /auth/login
        register?: string;                // défaut: /auth/register
        forgotPassword?: string;          // défaut: /auth/forgot-password
        resetPassword?: string;           // défaut: /auth/reset-password
        me?: string;                      // défaut: /auth/me (optionnel)
    };
    tokenHeaderName?: string;           // défaut: Authorization
    tokenPrefix?: string;               // défaut: Bearer
};

export const AUTH_CONFIG = new InjectionToken<AuthModuleConfig>('AUTH_CONFIG');