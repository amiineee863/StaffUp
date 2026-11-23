import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { assignmentsApi } from "../../api/assignments";
import { consultantsApi } from "../../api/consultants";
import { queryKeys } from "../../api/queryKeys";
import { useAuth } from "../../auth/useAuth";
import { Spinner } from "../../components/Spinner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { PageHeader } from "../../components/ui/PageHeader";
import { formatDate, SENIORITY_LABELS } from "../../lib/format";
import { ConsultantFormModal } from "./ConsultantFormModal";
import { SkillEditor } from "./SkillEditor";

export default function ConsultantDetailPage() {
    const { id } = useParams();
    const consultantId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, hasRole } = useAuth();
    const [editOpen, setEditOpen] = useState(false);

    const canManage = hasRole("ADMIN", "MANAGER");
    // Même règle que ConsultantAccess côté backend : manager/admin, ou le consultant lui-même.
    const canEditSkills = canManage || user?.consultantId === consultantId;

    const consultantQuery = useQuery({
        queryKey: queryKeys.consultants.detail(consultantId),
        queryFn: () => consultantsApi.get(consultantId),
    });

    const assignmentsQuery = useQuery({
        queryKey: queryKeys.assignments.list({ consultantId }),
        queryFn: () => assignmentsApi.list({ consultantId }),
    });

    const deleteMutation = useMutation({
        mutationFn: () => consultantsApi.remove(consultantId),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: queryKeys.consultants.detail(consultantId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.consultants.lists });
            queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
            navigate("/consultants", { replace: true });
        },
    });

    if (consultantQuery.isPending) return <Spinner />;
    if (consultantQuery.isError) return <ErrorMessage error={consultantQuery.error} />;

    const consultant = consultantQuery.data;
    const fullName = `${consultant.firstName} ${consultant.lastName}`;

    const handleDelete = () => {
        if (window.confirm(`Supprimer ${fullName} ? Ses affectations seront également supprimées.`)) {
            deleteMutation.mutate();
        }
    };

    return (
        <div className="space-y-6">
            <Link to="/consultants" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Consultants
            </Link>

            <PageHeader
                title={fullName}
                description={consultant.jobTitle}
                actions={
                    canManage && (
                        <>
                            <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
                                Modifier
                            </Button>
                            <Button variant="danger" icon={Trash2} onClick={handleDelete} disabled={deleteMutation.isPending}>
                                Supprimer
                            </Button>
                        </>
                    )
                }
            />

            {deleteMutation.isError && <ErrorMessage error={deleteMutation.error} />}

            <div className="grid gap-6 lg:grid-cols-3">
                <Card title="Informations">
                    <dl className="space-y-3 text-sm">
                        <div>
                            <dt className="text-slate-500">Email</dt>
                            <dd className="font-medium text-slate-900">{consultant.email}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Séniorité</dt>
                            <dd className="mt-1">
                                <Badge>{SENIORITY_LABELS[consultant.seniority]}</Badge>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Disponible à partir du</dt>
                            <dd className="font-medium text-slate-900">{formatDate(consultant.availableFrom)}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Fiche créée le</dt>
                            <dd className="font-medium text-slate-900">{formatDate(consultant.createdAt)}</dd>
                        </div>
                    </dl>
                </Card>

                <div className="lg:col-span-2">
                    <Card title="Compétences">
                        <SkillEditor consultant={consultant} canEdit={canEditSkills} />
                    </Card>
                </div>
            </div>

            <Card title="Affectations">
                {assignmentsQuery.isPending ? (
                    <Spinner />
                ) : assignmentsQuery.isError ? (
                    <ErrorMessage error={assignmentsQuery.error} />
                ) : assignmentsQuery.data.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucune affectation.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="py-2">Mission</th>
                            <th className="py-2">Client</th>
                            <th className="py-2">Rôle</th>
                            <th className="py-2">Période</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {assignmentsQuery.data.map((a) => (
                            <tr key={a.id}>
                                <td className="py-2">
                                    <Link to={`/missions/${a.missionId}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {a.missionTitle}
                                    </Link>
                                </td>
                                <td className="py-2 text-slate-700">{a.clientName}</td>
                                <td className="py-2 text-slate-700">{a.role ?? "—"}</td>
                                <td className="py-2 text-slate-700">
                                    {formatDate(a.startDate)} → {formatDate(a.endDate)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </Card>

            <ConsultantFormModal open={editOpen} onClose={() => setEditOpen(false)} consultant={consultant} />
        </div>
    );
}