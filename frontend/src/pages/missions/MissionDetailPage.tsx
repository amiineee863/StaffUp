import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { assignmentsApi } from "../../api/assignments";
import { missionsApi } from "../../api/missions";
import { queryKeys } from "../../api/queryKeys";
import { useAuth } from "../../auth/useAuth";
import { MissionStatusBadge } from "../../components/MissionStatusBadge";
import { Spinner } from "../../components/Spinner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { PageHeader } from "../../components/ui/PageHeader";
import { formatDate } from "../../lib/format";
import { MatchingPanel } from "./MatchingPanel";
import { MissionFormModal } from "./MissionFormModal";

export default function MissionDetailPage() {
    const { id } = useParams();
    const missionId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { hasRole } = useAuth();
    const canManage = hasRole("ADMIN", "MANAGER");
    const [editOpen, setEditOpen] = useState(false);

    const missionQuery = useQuery({
        queryKey: queryKeys.missions.detail(missionId),
        queryFn: () => missionsApi.get(missionId),
    });

    const assignmentsQuery = useQuery({
        queryKey: queryKeys.assignments.list({ missionId }),
        queryFn: () => assignmentsApi.list({ missionId }),
    });

    const deleteMission = useMutation({
        mutationFn: () => missionsApi.remove(missionId),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: queryKeys.missions.detail(missionId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.missions.lists });
            queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            navigate("/missions", { replace: true });
        },
    });

    const removeAssignment = useMutation({
        mutationFn: (assignmentId: number) => assignmentsApi.remove(assignmentId),
        onSuccess: () => {
            // La mission peut repasser en OPEN, et le consultant redevient disponible dans le matching.
            queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.missions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });

    if (missionQuery.isPending) return <Spinner />;
    if (missionQuery.isError) return <ErrorMessage error={missionQuery.error} />;

    const mission = missionQuery.data;

    const handleDelete = () => {
        if (window.confirm(`Supprimer la mission « ${mission.title} » et ses affectations ?`)) {
            deleteMission.mutate();
        }
    };

    const handleRemoveAssignment = (assignmentId: number, consultantName: string) => {
        if (window.confirm(`Retirer ${consultantName} de cette mission ?`)) {
            removeAssignment.mutate(assignmentId);
        }
    };

    return (
        <div className="space-y-6">
            <Link to="/missions" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Missions
            </Link>

            <PageHeader
                title={mission.title}
                description={mission.clientName}
                actions={
                    canManage && (
                        <>
                            <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
                                Modifier
                            </Button>
                            <Button variant="danger" icon={Trash2} onClick={handleDelete} disabled={deleteMission.isPending}>
                                Supprimer
                            </Button>
                        </>
                    )
                }
            />

            {deleteMission.isError && <ErrorMessage error={deleteMission.error} />}

            <div className="grid gap-6 lg:grid-cols-3">
                <Card title="Informations">
                    <dl className="space-y-3 text-sm">
                        <div>
                            <dt className="text-slate-500">Statut</dt>
                            <dd className="mt-1">
                                <MissionStatusBadge status={mission.status} />
                            </dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Période</dt>
                            <dd className="font-medium text-slate-900">
                                {formatDate(mission.startDate)} → {formatDate(mission.endDate)}
                            </dd>
                        </div>
                        {mission.description && (
                            <div>
                                <dt className="text-slate-500">Description</dt>
                                <dd className="whitespace-pre-line text-slate-700">{mission.description}</dd>
                            </div>
                        )}
                    </dl>
                </Card>

                <div className="lg:col-span-2">
                    <Card title="Compétences requises">
                        {mission.requiredSkills.length === 0 ? (
                            <p className="text-sm text-slate-500">Aucune compétence requise.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {mission.requiredSkills.map((skill) => (
                                    <Badge key={skill.id} tone="indigo">
                                        {skill.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <Card title="Consultants affectés">
                {assignmentsQuery.isPending ? (
                    <Spinner />
                ) : assignmentsQuery.isError ? (
                    <ErrorMessage error={assignmentsQuery.error} />
                ) : assignmentsQuery.data.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucun consultant affecté pour le moment.</p>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {assignmentsQuery.data.map((a) => (
                            <li key={a.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                                <div>
                                    <Link to={`/consultants/${a.consultantId}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {a.consultantName}
                                    </Link>
                                    <p className="text-xs text-slate-500">
                                        {a.role ?? "Rôle non précisé"} · {formatDate(a.startDate)} → {formatDate(a.endDate)}
                                    </p>
                                </div>
                                {canManage && (
                                    <Button
                                        variant="ghost"
                                        icon={X}
                                        onClick={() => handleRemoveAssignment(a.id, a.consultantName)}
                                        disabled={removeAssignment.isPending}
                                        aria-label={`Retirer ${a.consultantName}`}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {removeAssignment.isError && (
                    <div className="mt-3">
                        <ErrorMessage error={removeAssignment.error} />
                    </div>
                )}
            </Card>

            {canManage && (
                <Card title="Consultants recommandés">
                    <MatchingPanel mission={mission} />
                </Card>
            )}

            <MissionFormModal open={editOpen} onClose={() => setEditOpen(false)} mission={mission} />
        </div>
    );
}