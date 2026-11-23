import { api } from "./client";
import type { AssignmentListParams } from "./queryKeys";
import type { Assignment, AssignmentRequest } from "./types";

export const assignmentsApi = {
    list: (params: AssignmentListParams) =>
        api.get<Assignment[]>("/assignments", { params }).then((res) => res.data),

    create: (body: AssignmentRequest) => api.post<Assignment>("/assignments", body).then((res) => res.data),

    remove: (id: number) => api.delete(`/assignments/${id}`),
};