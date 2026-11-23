import type { ReactNode } from "react";

interface FieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    children: ReactNode;
}

export function Field({ label, htmlFor, error, children }: FieldProps) {
    return (
        <div>
            <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
                {label}
            </label>
            <div className="mt-1">{children}</div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}