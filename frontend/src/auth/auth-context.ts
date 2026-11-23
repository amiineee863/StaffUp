import { createContext } from "react";
import type { Role, User } from "../api/types";

export interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    hasRole: (...roles: Role[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);