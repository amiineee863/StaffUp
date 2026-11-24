import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { missionsApi } from "../../api/missions";
import { queryKeys } from "../../api/queryKeys";
import type { Mission } from "../../api/types";
import { ConsultantMatchRow } from "../../components/ConsultantMatchRow";
import { Spinner } from "../../components/Spinner";
import { Button } from "../../components/ui/Button";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { AssignmentFormModal } from "../assignments/AssignmentFormModal";

export function MatchingPanel({ mission }: { mission: Mission }) {
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
                    <ConsultantMatchRow
                        key={match.consultantId}
                        match={match}
                        action={
                            <Button
                                variant="secondary"
                                icon={UserPlus}
                                disabled={!match.available}
                                title={match.available ? undefined : "Ce consultant a déjà une affectation sur cette période"}
                                onClick={() => setTarget({ id: match.consultantId, name: match.consultantName })}
                            >
                                Affecter
                            </Button>
                        }
                    />
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