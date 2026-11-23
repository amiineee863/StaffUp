import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { isAxiosError } from "axios";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // On ne réessaie pas les erreurs 4xx (401, 403, 404...) : réessayer ne changera rien.
            retry: (failureCount, error) => {
                const status = isAxiosError(error) ? error.response?.status : undefined;
                if (status !== undefined && status >= 400 && status < 500) return false;
                return failureCount < 2;
            },
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>,
);