import { api } from "./client";
import type { MissionListParams } from "./queryKeys";
import type { ConsultantMatch, Mission, MissionRequest, Page } from "./types";

export const missionsApi = {
    list: ({ status, page, size }: MissionListParams) =>
        api
            .get<Page<Mission>>("/missions", {
                params: { status: status || undefined, page, size, sort: "startDate,asc" },
            })
            .then((res) => res.data),

    get: (id: number) => api.get<Mission>(`/missions/${id}`).then((res) => res.data),

    create: (body: MissionRequest) => api.post<Mission>("/missions", body).then((res) => res.data),

    update: (id: number, body: MissionRequest) =>
        api.put<Mission>(`/missions/${id}`, body).then((res) => res.data),

    remove: (id: number) => api.delete(`/missions/${id}`),

    matches: (id: number, limit = 10) =>
        api.get<ConsultantMatch[]>(`/missions/${id}/matches`, { params: { limit } }).then((res) => res.data),
};