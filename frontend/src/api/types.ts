// Types TypeScript qui correspondent aux records Java renvoyés par l'API.

export type Role = "ADMIN" | "MANAGER" | "CONSULTANT";
export type Seniority = "JUNIOR" | "CONFIRMED" | "SENIOR" | "EXPERT";
export type MissionStatus = "OPEN" | "STAFFED" | "CLOSED";
export type SkillCategory =
    | "BACKEND"
    | "FRONTEND"
    | "DATABASE"
    | "DEVOPS"
    | "CLOUD"
    | "DATA_AI"
    | "METHODOLOGY"
    | "OTHER";

// ===== Commun =====

export interface Page<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

/** Format d'erreur standard renvoyé par l'API (RFC 9457). */
export interface ProblemDetail {
    title?: string;
    status?: number;
    detail?: string;
    errors?: Record<string, string>;
}

// ===== Auth =====

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

// ===== Compétences =====

export interface Skill {
    id: number;
    name: string;
    category: SkillCategory;
}

// ===== Consultants =====

export interface ConsultantSkill {
    skillId: number;
    name: string;
    category: SkillCategory;
    level: number;
}

export interface Consultant {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string;
    seniority: Seniority;
    availableFrom: string | null;
    skills: ConsultantSkill[];
    createdAt: string;
    updatedAt: string;
}

export interface ConsultantRequest {
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string;
    seniority: Seniority;
    availableFrom: string | null;
}

// ===== Missions =====

export interface Mission {
    id: number;
    title: string;
    clientName: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    status: MissionStatus;
    requiredSkills: Skill[];
    createdAt: string;
    updatedAt: string;
}

export interface MissionRequest {
    title: string;
    clientName: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    status?: MissionStatus;
    requiredSkillIds: number[];
}

// ===== Affectations =====

export interface Assignment {
    id: number;
    consultantId: number;
    consultantName: string;
    missionId: number;
    missionTitle: string;
    clientName: string;
    role: string | null;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export interface AssignmentRequest {
    consultantId: number;
    missionId: number;
    role: string | null;
    startDate: string;
    endDate: string;
}

// ===== Matching =====

export interface MatchedSkill {
    name: string;
    level: number;
}

export interface ConsultantMatch {
    consultantId: number;
    consultantName: string;
    jobTitle: string;
    seniority: Seniority;
    score: number;
    available: boolean;
    matchedSkills: MatchedSkill[];
    missingSkills: string[];
}

// ===== Dashboard =====

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