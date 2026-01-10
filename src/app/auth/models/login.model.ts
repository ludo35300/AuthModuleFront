interface LoginResponse {
    success: boolean;
    token: string;
    user: { id: string; email: string; role: string };
    error?: string;
}