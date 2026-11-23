import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import type { Role, User } from "../api/types";
import { AuthContext, type AuthContextValue } from "./auth-context";
import { AUTH_LOGOUT_EVENT, tokenStorage } from "./tokenStorage";

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<User | null>(null);
    // Si un jeton existe au démarrage, on doit d'abord vérifier qu'il est encore valide.
    const [isLoading, setIsLoading] = useState(() => tokenStorage.get() !== null);

    // Au chargement de l'appli : on valide le jeton stocké en appelant /auth/me.
    useEffect(() => {
        if (!tokenStorage.get()) return;
        authApi
            .me()
            .then(setUser)
            .catch(() => tokenStorage.clear())
            .finally(() => setIsLoading(false));
    }, []);

    const logout = useCallback(() => {
        tokenStorage.clear();
        setUser(null);
        queryClient.clear(); // vide le cache : aucune donnée du compte précédent ne doit rester
    }, [queryClient]);

    // Déconnexion déclenchée par l'intercepteur axios (réponse 401).
    useEffect(() => {
        window.addEventListener(AUTH_LOGOUT_EVENT, logout);
        return () => window.removeEventListener(AUTH_LOGOUT_EVENT, logout);
    }, [logout]);

    const login = useCallback(async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        tokenStorage.set(response.accessToken);
        setUser(response.user);
        return response.user;
    }, []);

    const hasRole = useCallback(
        (...roles: Role[]) => user !== null && roles.includes(user.role),
        [user],
    );

    const value = useMemo<AuthContextValue>(
        () => ({ user, isLoading, login, logout, hasRole }),
        [user, isLoading, login, logout, hasRole],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}