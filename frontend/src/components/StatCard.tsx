import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    hint?: string;
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <Icon className="h-5 w-5 text-indigo-600" aria-hidden />
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
    );
}