import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
    page: number;
    totalPages: number;
    totalElements: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, onPageChange }: PaginationProps) {
    return (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
      <span>
        {totalElements} résultat{totalElements > 1 ? "s" : ""}
      </span>
            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        icon={ChevronLeft}
                        disabled={page === 0}
                        onClick={() => onPageChange(page - 1)}
                        aria-label="Page précédente"
                    />
                    <span>
            Page {page + 1} / {totalPages}
          </span>
                    <Button
                        variant="secondary"
                        icon={ChevronRight}
                        disabled={page >= totalPages - 1}
                        onClick={() => onPageChange(page + 1)}
                        aria-label="Page suivante"
                    />
                </div>
            )}
        </div>
    );
}