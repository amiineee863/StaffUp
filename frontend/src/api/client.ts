import axios from "axios";
import { AUTH_LOGOUT_EVENT, tokenStorage } from "../auth/tokenStorage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: { "Content-Type": "application/json" },
});

// Avant chaque requête : ajoute le jeton s'il existe.
api.interceptors.request.use((config) => {
    const token = tokenStorage.get();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Après chaque réponse : si 401 (jeton absent, invalide ou expiré), on déconnecte.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes("/auth/login");
        if (error.response?.status === 401 && !isLoginRequest) {
            tokenStorage.clear();
            window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
        }
        return Promise.reject(error);
    },
);