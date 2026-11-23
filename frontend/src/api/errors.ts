import { isAxiosError } from "axios";
import type { ProblemDetail } from "./types";

/** Transforme n'importe quelle erreur en message lisible pour l'utilisateur. */
export function getErrorMessage(error: unknown, fallback = "Une erreur est survenue"): string {
    if (isAxiosError<ProblemDetail>(error)) {
        if (!error.response) {
            return "Impossible de contacter le serveur. L'API est-elle démarrée ?";
        }
        return error.response.data?.detail ?? fallback;
    }
    return fallback;
}

/** Erreurs de validation par champ renvoyées par l'API (400), ex. { email: "doit être une adresse valide" }. */
export function getFieldErrors(error: unknown): Record<string, string> | undefined {
    if (isAxiosError<ProblemDetail>(error)) {
        return error.response?.data?.errors;
    }
    return undefined;
}