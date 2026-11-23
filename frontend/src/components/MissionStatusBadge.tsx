import type { MissionStatus } from "../api/types";
import { MISSION_STATUS_LABELS } from "../lib/format";
import { Badge, type BadgeTone } from "./ui/Badge";

const STATUS_TONES: Record<MissionStatus, BadgeTone> = {
    OPEN: "amber",
    STAFFED: "green",
    CLOSED: "slate",
};

export function MissionStatusBadge({ status }: { status: MissionStatus }) {
    return <Badge tone={STATUS_TONES[status]}>{MISSION_STATUS_LABELS[status]}</Badge>;
}