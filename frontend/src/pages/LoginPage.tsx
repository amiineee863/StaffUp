import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigate, useLocation, useNavigate, type Location } from "react-router";
import { getErrorMessage } from "../api/errors";
import { useAuth } from "../auth/useAuth";

const loginSchema = z.object({
    email: z.string().min(1, "L'email est obligatoire").email("Email invalide"),
    password: z.string().min(1, "Le mot de passe est obligatoire"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_PASSWORD = "Password123!";
const DEMO_ACCOUNTS = [
    { label: "Admin", email: "admin@staffup.dev" },
    { label: "Manager", email: "manager@staffup.dev" },
    { label: "Consultant", email: "sarah.lefebvre@staffup.dev" },
];

export default function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

    const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";

    if (user) {
        return <Navigate to={from} replace />;
    }

    const onSubmit = async (values: LoginFormValues) => {
        setServerError(null);
        try {
            await login(values.email, values.password);
            navigate(from, { replace: true });
        } catch (error) {
            setServerError(getErrorMessage(error, "Connexion impossible"));
        }
    };

    const fillDemoAccount = (email: string) => {
        setValue("email", email, { shouldValidate: true });
        setValue("password", DEMO_PASSWORD, { shouldValidate: true });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-indigo-600">StaffUp</h1>
                <p className="mt-1 text-sm text-slate-500">Connectez-vous pour accéder à la plateforme</p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            {...register("email")}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            {...register("password")}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                    </div>

                    {serverError && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                            {serverError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {isSubmitting ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                <div className="mt-6 border-t border-slate-200 pt-4">
                    <p className="text-xs font-medium text-slate-500">Comptes de démo (mot de passe : {DEMO_PASSWORD})</p>
                    <div className="mt-2 flex gap-2">
                        {DEMO_ACCOUNTS.map((account) => (
                            <button
                                key={account.email}
                                type="button"
                                onClick={() => fillDemoAccount(account.email)}
                                className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                            >
                                {account.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}