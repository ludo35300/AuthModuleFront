/** Payload minimal JWT utilisé par l'app */
export type JwtPayload = { exp?: number; sub?: string };
/** Réponse attendue du backend lors du login */
export type LoginResponse = { accessToken: string; user?: { email?: string } };
/** Réponse attendue du backend lors de l'inscription */
export type RegisterRequest = {
    email: string;
    firstName: string,
    lastName: string,
    password: string;
};

export type ApiError = { message: string };
export type User = { email: string; password: string; firstName?: string; lastName?: string };
export type ResetToken = { token: string; email: string; exp: number; used: boolean };
export type MeResponse = {
    email: string;
    firstName: string;
    lastName: string;
};