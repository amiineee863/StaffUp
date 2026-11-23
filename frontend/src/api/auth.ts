import { api } from "./client";
import type { LoginResponse, User } from "./types";

export const authApi = {
    login: (email: string, password: string) =>
        api.post<LoginResponse>("/auth/login", { email, password }).then((res) => res.data),

    me: () => api.get<User>("/auth/me").then((res) => res.data),
};