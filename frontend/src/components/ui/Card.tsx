import type { ReactNode } from "react";

interface CardProps {
    title?: string;
    actions?: ReactNode;
    children: ReactNode;
}

export function Card({ title, actions, children }: CardProps) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {(title || actions) && (
                <div className="mb-4 flex items-center justify-between gap-4">
                    {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
                    {actions}
                </div>
            )}
            {children}
        </section>
    );
}