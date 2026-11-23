import type { MissionStatus, Seniority, SkillCategory } from "../api/types";

export const SENIORITY_LABELS: Record<Seniority, string> = {
    JUNIOR: "Junior",
    CONFIRMED: "Confirmé",
    SENIOR: "Senior",
    EXPERT: "Expert",
};
export const SENIORITIES = Object.keys(SENIORITY_LABELS) as Seniority[];

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
    OPEN: "À pourvoir",
    STAFFED: "Staffée",
    CLOSED: "Clôturée",
};
export const MISSION_STATUSES = Object.keys(MISSION_STATUS_LABELS) as MissionStatus[];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
    BACKEND: "Backend",
    FRONTEND: "Frontend",
    DATABASE: "Base de données",
    DEVOPS: "DevOps",
    CLOUD: "Cloud",
    DATA_AI: "Data & IA",
    METHODOLOGY: "Méthodologie",
    OTHER: "Autre",
};

/** "2027-01-04" -> "04/01/2027". Pas de new Date() : évite les décalages de fuseau horaire. */
export function formatDate(isoDate: string | null | undefined): string {
    if (!isoDate) return "—";
    const [year, month, day] = isoDate.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
}

/** Date du jour au format ISO "AAAA-MM-JJ", dans le fuseau du navigateur. */
export function todayIso(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}