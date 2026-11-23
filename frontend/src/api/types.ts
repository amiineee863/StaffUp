// Types TypeScript qui correspondent aux records Java renvoyés par l'API.

export type Role = "ADMIN" | "MANAGER" | "CONSULTANT";
export type Seniority = "JUNIOR" | "CONFIRMED" | "SENIOR" | "EXPERT";
export type MissionStatus = "OPEN" | "STAFFED" | "CLOSED";

export interface User {
    id: number;
    email: string;
    role: Role;
    consultantId: number | null;
}

export interface LoginResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
}

/** Format d'erreur standard renvoyé par l'API (RFC 9457). */
export interface ProblemDetail {
    title?: string;
    status?: number;
    detail?: string;
    errors?: Record<string, string>;
}

export interface BenchConsultant {
    id: number;
    name: string;
    jobTitle: string;
    seniority: Seniority;
}

export interface UpcomingAvailability {
    consultantId: number;
    consultantName: string;
    missionTitle: string;
    endDate: string;
}

export interface SkillGap {
    skill: string;
    openMissions: number;
    consultants: number;
}

export interface DashboardResponse {
    date: string;
    totalConsultants: number;
    staffedConsultants: number;
    benchConsultants: number;
    staffingRate: number;
    missionsByStatus: Record<MissionStatus, number>;
    bench: BenchConsultant[];
    upcomingAvailabilities: UpcomingAvailability[];
    skillDemand: SkillGap[];
}