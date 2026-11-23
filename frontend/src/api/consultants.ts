import { api } from "./client";
import type { ConsultantListParams } from "./queryKeys";
import type { Consultant, ConsultantRequest, Page } from "./types";

export const consultantsApi = {
    list: ({ search, page, size }: ConsultantListParams) =>
        api
            .get<Page<Consultant>>("/consultants", {
                params: { search: search || undefined, page, size, sort: "lastName,asc" },
            })
            .then((res) => res.data),

    get: (id: number) => api.get<Consultant>(`/consultants/${id}`).then((res) => res.data),

    create: (body: ConsultantRequest) => api.post<Consultant>("/consultants", body).then((res) => res.data),

    update: (id: number, body: ConsultantRequest) =>
        api.put<Consultant>(`/consultants/${id}`, body).then((res) => res.data),

    remove: (id: number) => api.delete(`/consultants/${id}`),

    setSkill: (id: number, skillId: number, level: number) =>
        api.put<Consultant>(`/consultants/${id}/skills/${skillId}`, { level }).then((res) => res.data),

    removeSkill: (id: number, skillId: number) => api.delete(`/consultants/${id}/skills/${skillId}`),
};