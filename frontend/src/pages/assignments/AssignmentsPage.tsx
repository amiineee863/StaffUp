import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, X } from "lucide-react";
import { Link } from "react-router";
import { assignmentsApi } from "../../api/assignments";
import { queryKeys } from "../../api/queryKeys";
import type { Assignment } from "../../api/types";
import { useAuth } from "../../auth/useAuth";
import { Spinner } from "../../components/Spinner";
import { Badge, type BadgeTone } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { PageHeader } from "../../components/ui/PageHeader";
import { inputClassName } from "../../components/ui/styles";
import { formatDate, todayIso } from "../../lib/format";
import { AssignmentFormModal } from "./AssignmentFormModal";

type Period = "CURRENT" | "UPCOMING" | "PAST";
type PeriodFilter = Period | "ALL";

const PERIOD_LABELS: Record<Period, string> = {
    CURRENT: "En cours",
    UPCOMING: "À venir",
    PAST: "Terminée",
};

const PERIOD_TONES: Record<Period, BadgeTone> = {
    CURRENT: "green",
    UPCOMING: "indigo",
    PAST: "slate",
};

const FILTERS: { value: PeriodFilter; label: string }[] = [
    { value: "ALL", label: "Toutes" },
    { value: "CURRENT", label: "En cours" },
    { value: "UPCOMING", label: "À venir" },
    { value: "PAST", label: "Terminées" },
];

/** Les dates ISO se comparent comme des chaînes : "2026-12-14" < "2027-01-04". */
function periodOf(assignment: Assignment, today: string): Period {
    if (assignment.endDate < today) return "PAST";
    if (assignment.startDate > today) return "UPCOMING";
    return "CURRENT";
}

export default function AssignmentsPage() {
    const { hasRole } = useAuth();
    const canManage = hasRole("ADMIN", "MANAGER");
    const queryClient = useQueryClient();

    const [filter, setFilter] = useState<PeriodFilter>("ALL");
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const today = todayIso();

    const query = useQuery({
        queryKey: queryKeys.assignments.list({}),
        queryFn: () => assignmentsApi.list({}),
    });

    // Compteurs par période, pour les onglets.
    const counts = useMemo(() => {
        const result: Record<PeriodFilter, number> = { ALL: 0, CURRENT: 0, UPCOMING: 0, PAST: 0 };
        for (const a of query.data ?? []) {
            result.ALL++;
            result[periodOf(a, today)]++;
        }
        return result;
    }, [query.data, today]);

    // Filtrage côté client : période + recherche texte.
    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return (query.data ?? []).filter((a) => {
            const matchesPeriod = filter === "ALL" || periodOf(a, today) === filter;
            const matchesSearch =
                !term ||
                a.consultantName.toLowerCase().includes(term) ||
                a.missionTitle.toLowerCase().includes(term) ||
                a.clientName.toLowerCase().includes(term);
            return matchesPeriod && matchesSearch;
        });
    }, [query.data, filter, search, today]);

    const removeAssignment = useMutation({
        mutationFn: (id: number) => assignmentsApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.missions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });

    const handleRemove = (a: Assignment) => {
        if (window.confirm(`Supprimer l'affectation de ${a.consultantName} sur « ${a.missionTitle} » ?`)) {
            removeAssignment.mutate(a.id);
        }
    };

    return (
        <div>
            <PageHeader
                title="Affectations"
                description="Qui travaille sur quelle mission, et quand"
                actions={
                    canManage && (
                        <Button icon={Plus} onClick={() => setFormOpen(true)}>
                            Nouvelle affectation
                        </Button>
                    )
                }
            />

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1" role="group" aria-label="Filtrer par période">
                    {FILTERS.map((f) => (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => setFilter(f.value)}
                            aria-pressed={filter === f.value}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                filter === f.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            {f.label} <span className="opacity-70">({counts[f.value]})</span>
                        </button>
                    ))}
                </div>

                <div className="relative w-full max-w-xs">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden
                    />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Consultant, mission, client…"
                        aria-label="Rechercher une affectation"
                        className={`${inputClassName} pl-9`}
                    />
                </div>
            </div>

            {removeAssignment.isError && (
                <div className="mt-4">
                    <ErrorMessage error={removeAssignment.error} />
                </div>
            )}

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                {query.isPending ? (
                    <div className="flex justify-center p-10">
                        <Spinner />
                    </div>
                ) : query.isError ? (
                    <div className="p-6">
                        <ErrorMessage error={query.error} />
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="p-10 text-center text-sm text-slate-500">Aucune affectation.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Consultant</th>
                            <th className="px-4 py-3">Mission</th>
                            <th className="px-4 py-3">Rôle</th>
                            <th className="px-4 py-3">Période</th>
                            <th className="px-4 py-3">État</th>
                            {canManage && <th className="px-4 py-3" aria-label="Actions" />}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {filtered.map((a) => {
                            const period = periodOf(a, today);
                            return (
                                <tr key={a.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link to={`/consultants/${a.consultantId}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                            {a.consultantName}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link to={`/missions/${a.missionId}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                            {a.missionTitle}
                                        </Link>
                                        <p className="text-xs text-slate-500">{a.clientName}</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{a.role ?? "—"}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                                        {formatDate(a.startDate)} → {formatDate(a.endDate)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge tone={PERIOD_TONES[period]}>{PERIOD_LABELS[period]}</Badge>
                                    </td>
                                    {canManage && (
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                icon={X}
                                                onClick={() => handleRemove(a)}
                                                disabled={removeAssignment.isPending}
                                                aria-label={`Supprimer l'affectation de ${a.consultantName}`}
                                            />
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>

            <AssignmentFormModal open={formOpen} onClose={() => setFormOpen(false)} />
        </div>
    );
}