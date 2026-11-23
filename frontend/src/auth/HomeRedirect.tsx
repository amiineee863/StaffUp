import { Navigate } from "react-router";
import { useAuth } from "./useAuth";

/** Page d'accueil selon le rôle : dashboard pour les managers, liste des consultants sinon. */
export function HomeRedirect() {
    const { hasRole } = useAuth();
    return <Navigate to={hasRole("ADMIN", "MANAGER") ? "/dashboard" : "/consultants"} replace />;
}