import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { HomeRedirect } from "./auth/HomeRedirect";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Spinner } from "./components/Spinner";
import AssignmentsPage from "./pages/assignments/AssignmentsPage";
import ConsultantDetailPage from "./pages/consultants/ConsultantDetailPage";
import ConsultantsPage from "./pages/consultants/ConsultantsPage";
import LoginPage from "./pages/LoginPage";
import MissionDetailPage from "./pages/missions/MissionDetailPage";
import MissionsPage from "./pages/missions/MissionsPage";
import NotFoundPage from "./pages/NotFoundPage";
import MissionAnalysisPage from "./pages/analysis/MissionAnalysisPage";

// Le dashboard embarque la librairie de graphiques : on ne la télécharge
// que lorsqu'un manager ouvre réellement cette page.
const DashboardPage = lazy(() => import("./pages/DashboardPage"));

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route index element={<HomeRedirect />} />

                    <Route element={<ProtectedRoute roles={["ADMIN", "MANAGER"]} />}>
                        <Route
                            path="dashboard"
                            element={
                                <Suspense fallback={<Spinner />}>
                                    <DashboardPage />
                                </Suspense>
                            }
                        />
                        <Route path="analysis" element={<MissionAnalysisPage />} />
                    </Route>

                    <Route path="consultants" element={<ConsultantsPage />} />
                    <Route path="consultants/:id" element={<ConsultantDetailPage />} />
                    <Route path="missions" element={<MissionsPage />} />
                    <Route path="missions/:id" element={<MissionDetailPage />} />
                    <Route path="assignments" element={<AssignmentsPage />} />
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}