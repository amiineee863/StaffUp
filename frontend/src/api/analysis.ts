import { api } from "./client";
import type { MissionAnalysisRequest, MissionAnalysisResponse } from "./types";

export const analysisApi = {
    analyze: (body: MissionAnalysisRequest) =>
        api.post<MissionAnalysisResponse>("/missions/analyze", body).then((res) => res.data),
};