import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { Link } from "react-router";
import { missionsApi } from "../../api/missions";
import { queryKeys } from "../../api/queryKeys";
import type { Mission } from "../../api/types";
import { Spinner } from "../../components/Spinner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { SENIORITY_LABELS } from "../../lib/format";
import { AssignmentFormModal } from "../assignments/AssignmentFormModal";

function scoreClasses(score: number): string {
    if (score >= 75) return "bg-green-100 text-green-700";
    if (score >= 50) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
}

export function MatchingPanel({ mission }: { mission: Mission }) {
    // Consultant choisi pour l'affectation (null = modale fermée).
    const [target, setTarget] = useState<{ id: number; name: string } | null>(null);

    const canMatch = mission.requiredSkills.length > 0 && mission.status !== "CLOSED";

    const query = useQuery({
        queryKey: queryKeys.missions.matches(mission.id),
        queryFn: () => missionsApi.matches(mission.id),
        enabled: canMatch,
    });

    if (!canMatch) {
        return (
            <p className="text-sm text-slate-500">
                {mission.status === "CLOSED"
                    ? "La mission est clôturée."
                    : "Ajoutez des compétences requises à la mission pour lancer le matching."}
            </p>
        );
    }

    if (query.isPending) return <Spinner />;
    if (query.isError) return <ErrorMessage error={query.error} />;

    if (query.data.length === 0) {
        return <p className="text-sm text-slate-500">Aucun consultant ne possède les compétences demandées.</p>;
    }

    return (
        <>
            <ul className="divide-y divide-slate-100">
                {query.data.map((match) => (
                    <li key={match.consultantId} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${scoreClasses(match.score)}`}
                            aria-label={`Score de compatibilité : ${match.score} sur 100`}
                        >
                            {match.score}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <Link
                                    to={`/consultants/${match.consultantId}`}
                                    className="font-medium text-slate-900 hover:text-indigo-600"
                                >
                                    {match.consultantName}
                                </Link>
                                {match.available ? (
                                    <Badge tone="green">Disponible</Badge>
                                ) : (
                                    <Badge tone="red">Déjà en mission</Badge>
                                )}
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

                        <Button
                            variant="secondary"
                            icon={UserPlus}
                            disabled={!match.available}
                            title={match.available ? undefined : "Ce consultant a déjà une affectation sur cette période"}
                            onClick={() => setTarget({ id: match.consultantId, name: match.consultantName })}
                        >
                            Affecter
                        </Button>
                    </li>
                ))}
            </ul>

            <AssignmentFormModal
                open={target !== null}
                onClose={() => setTarget(null)}
                mission={mission}
                consultant={target ?? undefined}
            />
        </>
    );
}