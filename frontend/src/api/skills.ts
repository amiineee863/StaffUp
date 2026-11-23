import { api } from "./client";
import type { Skill } from "./types";

export const skillsApi = {
    list: () => api.get<Skill[]>("/skills").then((res) => res.data),
};