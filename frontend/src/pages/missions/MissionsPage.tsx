import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { missionsApi } from "../../api/missions";
import { queryKeys } from "../../api/queryKeys";
import type { MissionStatus } from "../../api/types";
import { useAuth } from "../../auth/useAuth";
import { MissionStatusBadge } from "../../components/MissionStatusBadge";
import { Spinner } from "../../components/Spinner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { formatDate, MISSION_STATUSES, MISSION_STATUS_LABELS } from "../../lib/format";
import { MissionFormModal } from "./MissionFormModal";

const PAGE_SIZE = 10;

const STATUS_FILTERS: { value: MissionStatus | ""; label: string }[] = [
    { value: "", label: "Toutes" },
    ...MISSION_STATUSES.map((status) => ({ value: status, label: MISSION_STATUS_LABELS[status] })),
];

export default function MissionsPage() {
    const { hasRole } = useAuth();
    const canManage = hasRole("ADMIN", "MANAGER");
    const navigate = useNavigate();

    const [status, setStatus] = useState<MissionStatus | "">("");
    const [page, setPage] = useState(0);
    const [formOpen, setFormOpen] = useState(false);

    const params = { status, page, size: PAGE_SIZE };
    const query = useQuery({
        queryKey: queryKeys.missions.list(params),
        queryFn: () => missionsApi.list(params),
        placeholderData: keepPreviousData,
    });

    return (
        <div>
            <PageHeader
                title="Missions"
                description="Les missions client et les compétences qu'elles demandent"
                actions={
                    canManage && (
                        <Button icon={Plus} onClick={() => setFormOpen(true)}>
                            Nouvelle mission
                        </Button>
                    )
                }
            />

            <div className="mt-6 inline-flex rounded-lg border border-slate-200 bg-white p-1" role="group" aria-label="Filtrer par statut">
                {STATUS_FILTERS.map((filter) => (
                    <button
                        key={filter.value || "ALL"}
                        type="button"
                        onClick={() => {
                            setStatus(filter.value);
                            setPage(0);
                        }}
                        aria-pressed={status === filter.value}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            status === filter.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                {query.isPending ? (
                    <div className="flex justify-center p-10">
                        <Spinner />
                    </div>
                ) : query.isError ? (
                    <div className="p-6">
                        <ErrorMessage error={query.error} />
                    </div>
                ) : query.data.content.length === 0 ? (
                    <p className="p-10 text-center text-sm text-slate-500">Aucune mission.</p>
                ) : (
                    <table className={`w-full text-sm transition-opacity ${query.isFetching ? "opacity-60" : ""}`}>
                        <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Mission</th>
                            <th className="px-4 py-3">Période</th>
                            <th className="px-4 py-3">Statut</th>
                            <th className="px-4 py-3">Compétences requises</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {query.data.content.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <Link to={`/missions/${m.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {m.title}
                                    </Link>
                                    <p className="text-xs text-slate-500">{m.clientName}</p>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                                    {formatDate(m.startDate)} → {formatDate(m.endDate)}
                                </td>
                                <td className="px-4 py-3">
                                    <MissionStatusBadge status={m.status} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap items-center gap-1">
                                        {m.requiredSkills.slice(0, 4).map((s) => (
                                            <Badge key={s.id} tone="indigo">
                                                {s.name}
                                            </Badge>
                                        ))}
                                        {m.requiredSkills.length > 4 && (
                                            <span className="text-xs text-slate-400">+{m.requiredSkills.length - 4}</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {query.data && (
                <Pagination
                    page={query.data.page}
                    totalPages={query.data.totalPages}
                    totalElements={query.data.totalElements}
                    onPageChange={setPage}
                />
            )}

            <MissionFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={(mission) => navigate(`/missions/${mission.id}`)}
            />
        </div>
    );
}