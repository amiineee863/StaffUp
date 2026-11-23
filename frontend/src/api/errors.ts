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