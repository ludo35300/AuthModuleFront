export interface TokenStorage {
    get(): string | null;
    set(token: string): void;
    clear(): void;
}