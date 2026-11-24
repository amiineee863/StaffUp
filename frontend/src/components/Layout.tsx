import { Briefcase, CalendarRange, LayoutDashboard, LogOut, Sparkles, Users, type LucideIcon } from "lucide-react";
import { NavLink, Outlet } from "react-router";
import type { Role } from "../api/types";
import { useAuth } from "../auth/useAuth";

interface NavItem {
    to: string;
    label: string;
    icon: LucideIcon;
    roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER"] },
    { to: "/consultants", label: "Consultants", icon: Users },
    { to: "/missions", label: "Missions", icon: Briefcase },
    { to: "/assignments", label: "Affectations", icon: CalendarRange },
    { to: "/analysis", label: "Analyse IA", icon: Sparkles, roles: ["ADMIN", "MANAGER"] },
];

const ROLE_LABELS: Record<Role, string> = {
    ADMIN: "Administrateur",
    MANAGER: "Manager",
    CONSULTANT: "Consultant",
};

export function Layout() {
    const { user, logout, hasRole } = useAuth();
    const visibleItems = NAV_ITEMS.filter((item) => !item.roles || hasRole(...item.roles));

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Menu latéral */}
            <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
                <div className="px-6 py-5">
                    <span className="text-xl font-bold text-indigo-600">StaffUp</span>
                </div>
                <nav className="flex-1 space-y-1 px-3">
                    {visibleItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                                }`
                            }
                        >
                            <Icon className="h-4 w-4" aria-hidden />
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Contenu */}
            <div className="flex flex-1 flex-col">
                <header className="flex items-center justify-end gap-4 border-b border-slate-200 bg-white px-8 py-3">
                    {user && (
                        <>
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-900">{user.email}</p>
                                <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
                            </div>
                            <button
                                type="button"
                                onClick={logout}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                            >
                                <LogOut className="h-4 w-4" aria-hidden />
                                Déconnexion
                            </button>
                        </>
                    )}
                </header>
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}