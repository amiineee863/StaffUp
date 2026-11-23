import { Navigate, Outlet, useLocation } from "react-router";
import type { Role } from "../api/types";
import { Spinner } from "../components/Spinner";
import { useAuth } from "./useAuth";

interface ProtectedRouteProps {
    roles?: Role[];
}

/** Laisse passer uniquement les utilisateurs connectés (et ayant l'un des rôles, si précisé). */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!user) {
        // On mémorise la page demandée pour y revenir après la connexion.
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}