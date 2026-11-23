import { Link } from "react-router";

export default function NotFoundPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-slate-50">
            <p className="text-5xl font-bold text-indigo-600">404</p>
            <p className="text-slate-600">Cette page n'existe pas.</p>
            <Link to="/" className="text-sm font-medium text-indigo-600 hover:underline">
                Retour à l'accueil
            </Link>
        </div>
    );
}