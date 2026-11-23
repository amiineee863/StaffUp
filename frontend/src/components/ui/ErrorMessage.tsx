import { getErrorMessage } from "../../api/errors";

export function ErrorMessage({ error }: { error: unknown }) {
    return (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {getErrorMessage(error)}
        </p>
    );
}