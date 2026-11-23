import type { MissionStatus } from "./types";

export interface ConsultantListParams {
    search: string;
    page: number;
    size: number;
}

export interface MissionListParams {
    status: MissionStatus | "";
    page: number;
    size: number;
}

export interface AssignmentListParams {
    consultantId?: number;
    missionId?: number;
}

/**
 * Toutes les clés de cache TanStack Query au même endroit ("query key factory").
 * Les clés sont hiérarchiques : invalider ["consultants"] invalide aussi
 * ["consultants", "list", ...] et ["consultants", "detail", ...].
 */
export const queryKeys = {
    consultants: {
        all: ["consultants"] as const,
        lists: ["consultants", "list"] as const,
        list: (params: ConsultantListParams) => ["consultants", "list", params] as const,
        detail: (id: number) => ["consultants", "detail", id] as const,
    },
    missions: {
        all: ["missions"] as const,
        lists: ["missions", "list"] as const,
        list: (params: MissionListParams) => ["missions", "list", params] as const,
        detail: (id: number) => ["missions", "detail", id] as const,
        matches: (id: number) => ["missions", "matches", id] as const,
    },
    assignments: {
        all: ["assignments"] as const,
        list: (params: AssignmentListParams) => ["assignments", "list", params] as const,
    },
    skills: {
        all: ["skills"] as const,
    },
    dashboard: ["dashboard"] as const,
};