import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { consultantsApi } from "../../api/consultants";
import { queryKeys } from "../../api/queryKeys";
import { useAuth } from "../../auth/useAuth";
import { Spinner } from "../../components/Spinner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { inputClassName } from "../../components/ui/styles";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate, SENIORITY_LABELS } from "../../lib/format";
import { ConsultantFormModal } from "./ConsultantFormModal";

const PAGE_SIZE = 10;

export default function ConsultantsPage() {
    const { hasRole } = useAuth();
    const canManage = hasRole("ADMIN", "MANAGER");
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const debouncedSearch = useDebounce(search.trim());

    const params = { search: debouncedSearch, page, size: PAGE_SIZE };
    const query = useQuery({
        queryKey: queryKeys.consultants.list(params),
        queryFn: () => consultantsApi.list(params),
        placeholderData: keepPreviousData,
    });

    return (
        <div>
            <PageHeader
                title="Consultants"
                description="Les consultants de l'ESN, leurs compétences et leur disponibilité"
                actions={
                    canManage && (
                        <Button icon={Plus} onClick={() => setFormOpen(true)}>
                            Nouveau consultant
                        </Button>
                    )
                }
            />

            <div className="relative mt-6 max-w-sm">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                />
                <input
                    type="search"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0); // nouvelle recherche -> retour à la première page
                    }}
                    placeholder="Rechercher par nom…"
                    aria-label="Rechercher un consultant"
                    className={`${inputClassName} pl-9`}
                />
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                {query.isPending ? (
                    <div className="flex justify-center p-10">
                        <Spinner />
                    </div>
                ) : query.isError ? (
                    <div className="p-6">
                        <ErrorMessage error={query.error} />
                    </div>
                ) : query.data.content.length === 0 ? (
                    <p className="p-10 text-center text-sm text-slate-500">Aucun consultant trouvé.</p>
                ) : (
                    <table className={`w-full text-sm transition-opacity ${query.isFetching ? "opacity-60" : ""}`}>
                        <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Nom</th>
                            <th className="px-4 py-3">Poste</th>
                            <th className="px-4 py-3">Séniorité</th>
                            <th className="px-4 py-3">Compétences principales</th>
                            <th className="px-4 py-3">Disponible le</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {query.data.content.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <Link to={`/consultants/${c.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {c.firstName} {c.lastName}
                                    </Link>
                                    <p className="text-xs text-slate-500">{c.email}</p>
                                </td>
                                <td className="px-4 py-3 text-slate-700">{c.jobTitle}</td>
                                <td className="px-4 py-3">
                                    <Badge>{SENIORITY_LABELS[c.seniority]}</Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap items-center gap-1">
                                        {c.skills.slice(0, 3).map((s) => (
                                            <Badge key={s.skillId} tone="indigo">
                                                {s.name} · {s.level}
                                            </Badge>
                                        ))}
                                        {c.skills.length > 3 && (
                                            <span className="text-xs text-slate-400">+{c.skills.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-700">{formatDate(c.availableFrom)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {query.data && (
                <Pagination
                    page={query.data.page}
                    totalPages={query.data.totalPages}
                    totalElements={query.data.totalElements}
                    onPageChange={setPage}
                />
            )}

            <ConsultantFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={(consultant) => navigate(`/consultants/${consultant.id}`)}
            />
        </div>
    );
}