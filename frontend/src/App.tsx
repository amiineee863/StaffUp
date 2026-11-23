import { Route, Routes } from "react-router";
import { HomeRedirect } from "./auth/HomeRedirect";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import ComingSoonPage from "./pages/ComingSoonPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Tout ce qui suit nécessite d'être connecté */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<HomeRedirect />} />

            {/* Réservé aux ADMIN et MANAGER */}
            <Route element={<ProtectedRoute roles={["ADMIN", "MANAGER"]} />}>
              <Route path="dashboard" element={<DashboardPage />} />
            </Route>

            <Route path="consultants" element={<ComingSoonPage title="Consultants" />} />
            <Route path="missions" element={<ComingSoonPage title="Missions" />} />
            <Route path="assignments" element={<ComingSoonPage title="Affectations" />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  );
}