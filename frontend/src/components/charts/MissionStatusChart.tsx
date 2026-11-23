import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MissionStatus } from "../../api/types";
import { MISSION_STATUSES, MISSION_STATUS_LABELS } from "../../lib/format";
import { CHART_THEME } from "./chartTheme";

export function MissionStatusChart({ data }: { data: Record<MissionStatus, number> }) {
    const rows = MISSION_STATUSES.map((status) => ({
        status: MISSION_STATUS_LABELS[status],
        count: data[status],
    }));
    const summary = rows.map((r) => `${r.status} : ${r.count}`).join(", ");

    return (
        <div className="h-64" role="img" aria-label={`Missions par statut. ${summary}`}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} margin={{ top: 24, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid vertical={false} stroke={CHART_THEME.grid} />
                    <XAxis
                        dataKey="status"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
                    />
                    <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
                    />
                    <Tooltip cursor={{ fill: CHART_THEME.cursor }} />
                    <Bar dataKey="count" name="Missions" fill={CHART_THEME.series1} radius={[4, 4, 0, 0]} maxBarSize={48}>
                        <LabelList dataKey="count" position="top" fill={CHART_THEME.text} fontSize={12} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}