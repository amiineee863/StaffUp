import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SkillGap } from "../../api/types";
import { CHART_THEME } from "./chartTheme";

const MAX_SKILLS = 8;

export function SkillDemandChart({ data }: { data: SkillGap[] }) {
    if (data.length === 0) {
        return <p className="text-sm text-slate-500">Aucune mission ouverte avec des compétences requises.</p>;
    }

    // L'API trie déjà par demande décroissante : on garde les compétences les plus demandées.
    const rows = data.slice(0, MAX_SKILLS);
    const height = rows.length * 44 + 56;

    return (
        <div>
            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barGap={2}>
                        <CartesianGrid horizontal={false} stroke={CHART_THEME.grid} />
                        <XAxis
                            type="number"
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
                        />
                        <YAxis
                            type="category"
                            dataKey="skill"
                            width={110}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: CHART_THEME.text, fontSize: 12 }}
                        />
                        <Tooltip cursor={{ fill: CHART_THEME.cursor }} />
                        <Legend
                            wrapperStyle={{ fontSize: 12 }}
                            formatter={(value) => <span className="text-slate-700">{value}</span>}
                        />
                        <Bar
                            dataKey="openMissions"
                            name="Missions ouvertes qui la demandent"
                            fill={CHART_THEME.series1}
                            radius={[0, 4, 4, 0]}
                            maxBarSize={14}
                        />
                        <Bar
                            dataKey="consultants"
                            name="Consultants qui la maîtrisent"
                            fill={CHART_THEME.series2}
                            radius={[0, 4, 4, 0]}
                            maxBarSize={14}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Les données sous forme de tableau : accessibles sans dépendre des couleurs ou de la souris. */}
            <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-slate-500 hover:text-indigo-600">Voir les données</summary>
                <table className="mt-2 w-full">
                    <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                        <th className="py-1">Compétence</th>
                        <th className="py-1 text-right">Missions ouvertes</th>
                        <th className="py-1 text-right">Consultants</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.map((row) => (
                        <tr key={row.skill}>
                            <td className="py-1">{row.skill}</td>
                            <td className="py-1 text-right">{row.openMissions}</td>
                            <td className="py-1 text-right">{row.consultants}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </details>
        </div>
    );
}