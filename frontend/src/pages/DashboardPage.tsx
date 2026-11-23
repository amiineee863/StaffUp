import { useQuery } from "@tanstack/react-query";
import { Briefcase, Percent, UserCheck, Users } from "lucide-react";
import { Link } from "react-router";
import { dashboardApi } from "../api/dashboard";
import { queryKeys } from "../api/queryKeys";
import { MissionStatusChart } from "../components/charts/MissionStatusChart";
import { SkillDemandChart } from "../components/charts/SkillDemandChart";
import { Spinner } from "../components/Spinner";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { PageHeader } from "../components/ui/PageHeader";
import { formatDate, SENIORITY_LABELS } from "../lib/format";

export default function DashboardPage() {
    const query = useQuery({
        queryKey: queryKeys.dashboard,
        queryFn: dashboardApi.get,
    });

    if (query.isPending) return <Spinner />;
    if (query.isError) return <ErrorMessage error={query.error} />;

    const data = query.data;

    return (
        <div className="space-y-6">
            <PageHeader title="Dashboard" description={`Situation au ${formatDate(data.date)}`} />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Consultants" value={data.totalConsultants} icon={Users} />
                <StatCard label="En mission" value={data.staffedConsultants} icon={UserCheck} />
                <StatCard
                    label="Intercontrat"
                    value={data.benchConsultants}
                    icon={Briefcase}
                    hint="Sans affectation aujourd'hui"
                />
                <StatCard
                    label="Taux de staffing"
                    value={`${data.staffingRate} %`}
                    icon={Percent}
                    hint="Consultants en mission / total"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card title="Missions par statut">
                    <MissionStatusChart data={data.missionsByStatus} />
                </Card>
                <Card title="Compétences : demande et offre">
                    <SkillDemandChart data={data.skillDemand} />
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card title={`Consultants en intercontrat (${data.bench.length})`}>
                    {data.bench.length === 0 ? (
                        <p className="text-sm text-slate-500">Tous les consultants sont en mission.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {data.bench.map((c) => (
                                <li key={c.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                                    <div>
                                        <Link to={`/consultants/${c.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                            {c.name}
                                        </Link>
                                        <p className="text-xs text-slate-500">{c.jobTitle}</p>
                                    </div>
                                    <Badge>{SENIORITY_LABELS[c.seniority]}</Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Fins de mission dans les 30 jours">
                    {data.upcomingAvailabilities.length === 0 ? (
                        <p className="text-sm text-slate-500">Aucune fin de mission prévue.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {data.upcomingAvailabilities.map((u) => (
                                <li key={`${u.consultantId}-${u.endDate}`} className="flex items-center justify-between gap-4 py-2 text-sm">
                                    <div>
                                        <Link
                                            to={`/consultants/${u.consultantId}`}
                                            className="font-medium text-slate-900 hover:text-indigo-600"
                                        >
                                            {u.consultantName}
                                        </Link>
                                        <p className="text-xs text-slate-500">{u.missionTitle}</p>
                                    </div>
                                    <span className="whitespace-nowrap text-slate-700">fin le {formatDate(u.endDate)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
}