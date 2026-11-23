import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { consultantsApi } from "../../api/consultants";
import { getErrorMessage, getFieldErrors } from "../../api/errors";
import { queryKeys } from "../../api/queryKeys";
import type { Consultant, ConsultantRequest } from "../../api/types";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { inputClassName } from "../../components/ui/styles";
import { SENIORITIES, SENIORITY_LABELS } from "../../lib/format";

const consultantSchema = z.object({
    firstName: z.string().trim().min(1, "Le prénom est obligatoire").max(100, "100 caractères maximum"),
    lastName: z.string().trim().min(1, "Le nom est obligatoire").max(100, "100 caractères maximum"),
    email: z.string().trim().min(1, "L'email est obligatoire").email("Email invalide"),
    jobTitle: z.string().trim().min(1, "Le poste est obligatoire").max(150, "150 caractères maximum"),
    seniority: z.enum(["JUNIOR", "CONFIRMED", "SENIOR", "EXPERT"]),
    availableFrom: z.string(),
});

type ConsultantFormValues = z.infer<typeof consultantSchema>;

function toFormValues(consultant?: Consultant): ConsultantFormValues {
    return {
        firstName: consultant?.firstName ?? "",
        lastName: consultant?.lastName ?? "",
        email: consultant?.email ?? "",
        jobTitle: consultant?.jobTitle ?? "",
        seniority: consultant?.seniority ?? "JUNIOR",
        availableFrom: consultant?.availableFrom ?? "",
    };
}

interface ConsultantFormModalProps {
    open: boolean;
    onClose: () => void;
    /** Absent = création, présent = modification. */
    consultant?: Consultant;
    onSaved?: (consultant: Consultant) => void;
}

export function ConsultantFormModal({ open, onClose, consultant, onSaved }: ConsultantFormModalProps) {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<ConsultantFormValues>({
        resolver: zodResolver(consultantSchema),
        defaultValues: toFormValues(consultant),
    });

    const {
        mutate,
        isPending,
        error,
        reset: resetMutation,
    } = useMutation({
        mutationFn: (body: ConsultantRequest) =>
            consultant ? consultantsApi.update(consultant.id, body) : consultantsApi.create(body),
        onSuccess: (saved) => {
            queryClient.setQueryData(queryKeys.consultants.detail(saved.id), saved);
            queryClient.invalidateQueries({ queryKey: queryKeys.consultants.lists });
            onSaved?.(saved);
            onClose();
        },
        onError: (err) => {
            // Erreurs de validation du serveur -> affichées sous les bons champs
            const fieldErrors = getFieldErrors(err);
            if (fieldErrors) {
                for (const [field, message] of Object.entries(fieldErrors)) {
                    setError(field as keyof ConsultantFormValues, { message });
                }
            }
        },
    });

    // À chaque ouverture : on repart des valeurs du consultant (ou d'un formulaire vide).
    useEffect(() => {
        if (open) {
            reset(toFormValues(consultant));
            resetMutation();
        }
    }, [open, consultant, reset, resetMutation]);

    const onSubmit = (values: ConsultantFormValues) => {
        mutate({ ...values, availableFrom: values.availableFrom || null });
    };

    const globalError = error && !getFieldErrors(error) ? getErrorMessage(error) : null;

    return (
        <Modal open={open} onClose={onClose} title={consultant ? "Modifier le consultant" : "Nouveau consultant"}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Prénom" htmlFor="firstName" error={errors.firstName?.message}>
                        <input id="firstName" {...register("firstName")} className={inputClassName} />
                    </Field>
                    <Field label="Nom" htmlFor="lastName" error={errors.lastName?.message}>
                        <input id="lastName" {...register("lastName")} className={inputClassName} />
                    </Field>
                </div>

                <Field label="Email" htmlFor="email" error={errors.email?.message}>
                    <input id="email" type="email" {...register("email")} className={inputClassName} />
                </Field>

                <Field label="Poste" htmlFor="jobTitle" error={errors.jobTitle?.message}>
                    <input
                        id="jobTitle"
                        {...register("jobTitle")}
                        placeholder="Développeur Java"
                        className={inputClassName}
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Séniorité" htmlFor="seniority" error={errors.seniority?.message}>
                        <select id="seniority" {...register("seniority")} className={inputClassName}>
                            {SENIORITIES.map((s) => (
                                <option key={s} value={s}>
                                    {SENIORITY_LABELS[s]}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Disponible à partir du" htmlFor="availableFrom" error={errors.availableFrom?.message}>
                        <input id="availableFrom" type="date" {...register("availableFrom")} className={inputClassName} />
                    </Field>
                </div>

                {globalError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                        {globalError}
                    </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}