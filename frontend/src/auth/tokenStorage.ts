const TOKEN_KEY = "staffup.token";

/** Événement émis quand l'API répond 401 : l'AuthProvider déconnecte l'utilisateur. */
export const AUTH_LOGOUT_EVENT = "staffup:logout";

export const tokenStorage = {
    get: (): string | null => localStorage.getItem(TOKEN_KEY),
    set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
    clear: (): void => localStorage.removeItem(TOKEN_KEY),
};