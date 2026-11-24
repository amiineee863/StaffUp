import type { ReactNode } from "react";
import { Link } from "react-router";
import type { ConsultantMatch } from "../api/types";
import { SENIORITY_LABELS } from "../lib/format";
import { Badge } from "./ui/Badge";

function scoreClasses(score: number): string {
    if (score >= 75) return "bg-green-100 text-green-700";
    if (score >= 50) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
}

interface ConsultantMatchRowProps {
    match: ConsultantMatch;
    /** Bouton d'action facultatif (ex. "Affecter"). */
    action?: ReactNode;
}

export function ConsultantMatchRow({ match, action }: ConsultantMatchRowProps) {
    return (
        <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${scoreClasses(match.score)}`}
                aria-label={`Score de compatibilité : ${match.score} sur 100`}
            >
                {match.score}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/consultants/${match.consultantId}`} className="font-medium text-slate-900 hover:text-indigo-600">
                        {match.consultantName}
                    </Link>
                    {match.available ? <Badge tone="green">Disponible</Badge> : <Badge tone="red">Déjà en mission</Badge>}
                </div>
                <p className="text-xs text-slate-500">
                    {match.jobTitle} · {SENIORITY_LABELS[match.seniority]}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                    {match.matchedSkills.map((s) => (
                        <Badge key={s.name} tone="indigo">
                            {s.name} {s.level}/5
                        </Badge>
                    ))}
                    {match.missingSkills.map((name) => (
                        <Badge key={name} tone="slate">
                            <span className="line-through">{name}</span>
                        </Badge>
                    ))}
                </div>
            </div>

            {action}
        </li>
    );
}