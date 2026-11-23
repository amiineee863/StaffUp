import { useQuery } from "@tanstack/react-query";
import { Briefcase, Percent, UserCheck, Users } from "lucide-react";
import { dashboardApi } from "../api/dashboard";
import { getErrorMessage } from "../api/errors";
import { Spinner } from "../components/Spinner";
import { StatCard } from "../components/StatCard";

export default function DashboardPage() {
    const { data, isPending, error } = useQuery({
        queryKey: ["dashboard"],
        queryFn: dashboardApi.get,
    });

    if (isPending) {
        return <Spinner />;
    }

    if (error) {
        return <p className="text-red-600">{getErrorMessage(error)}</p>;
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
                Situation au {new Date(data.date).toLocaleDateString("fr-FR")}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Consultants" value={data.totalConsultants} icon={Users} />
                <StatCard label="En mission" value={data.staffedConsultants} icon={UserCheck} />
                <StatCard label="Intercontrat" value={data.benchConsultants} icon={Briefcase} />
                <StatCard label="Taux de staffing" value={`${data.staffingRate} %`} icon={Percent} />
            </div>

            <p className="mt-8 text-sm text-slate-400">Graphiques et listes détaillées : étape 8.</p>
        </div>
    );
}