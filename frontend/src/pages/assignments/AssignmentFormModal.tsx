import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignmentsApi } from "../../api/assignments";
import { consultantsApi } from "../../api/consultants";
import { getErrorMessage, getFieldErrors } from "../../api/errors";
import { missionsApi } from "../../api/missions";
import { queryKeys, type ConsultantListParams, type MissionListParams } from "../../api/queryKeys";
import type { Assignment, AssignmentRequest, Mission } from "../../api/types";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { inputClassName } from "../../components/ui/styles";
import { formatDate } from "../../lib/format";

const ALL_MISSIONS: MissionListParams = { status: "", page: 0, size: 100 };
const ALL_CONSULTANTS: ConsultantListParams = { search: "", page: 0, size: 100 };

const assignmentSchema = z
    .object({
        consultantId: z.string().min(1, "Choisissez un consultant"),
        missionId: z.string().min(1, "Choisissez une mission"),
        role: z.string().trim().max(100, "100 caractères maximum"),
        startDate: z.string().min(1, "La date de début est obligatoire"),
        endDate: z.string().min(1, "La date de fin est obligatoire"),
    })
    .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
        message: "La date de fin doit être postérieure ou égale à la date de début",
        path: ["endDate"],
    });

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface AssignmentFormModalProps {
    open: boolean;
    onClose: () => void;
    /** Si fournie : mission imposée (pas de liste déroulante). */
    mission?: Mission;
    /** Si fourni : consultant imposé. À passer depuis un état (useState) pour garder une référence stable. */
    consultant?: { id: number; name: string };
    onSaved?: (assignment: Assignment) => void;
}

export function AssignmentFormModal({ open, onClose, mission, consultant, onSaved }: AssignmentFormModalProps) {
    const queryClient = useQueryClient();

    // Listes chargées uniquement si nécessaire (modale ouverte et valeur non imposée).
    const missionsQuery = useQuery({
        queryKey: queryKeys.missions.list(ALL_MISSIONS),
        queryFn: () => missionsApi.list(ALL_MISSIONS),
        enabled: open && !mission,
    });
    const consultantsQuery = useQuery({
        queryKey: queryKeys.consultants.list(ALL_CONSULTANTS),
        queryFn: () => consultantsApi.list(ALL_CONSULTANTS),
        enabled: open && !consultant,
    });

    const {
        register,
        handleSubmit,
        reset,
        setError,
        control,
        formState: { errors },
    } = useForm<AssignmentFormValues>({ resolver: zodResolver(assignmentSchema) });

    const {
        mutate,
        isPending,
        error,
        reset: resetMutation,
    } = useMutation({
        mutationFn: (body: AssignmentRequest) => assignmentsApi.create(body),
        onSuccess: (saved) => {
            // Une affectation change beaucoup de choses : statut de mission, matching, dashboard...
            queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.missions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            onSaved?.(saved);
            onClose();
        },
        onError: (err) => {
            const fieldErrors = getFieldErrors(err);
            if (fieldErrors) {
                for (const [field, message] of Object.entries(fieldErrors)) {
                    setError(field as keyof AssignmentFormValues, { message });
                }
            }
        },
    });

    // À l'ouverture : dates de la mission proposées par défaut.
    useEffect(() => {
        if (open) {
            reset({
                consultantId: consultant ? String(consultant.id) : "",
                missionId: mission ? String(mission.id) : "",
                role: "",
                startDate: mission?.startDate ?? "",
                endDate: mission?.endDate ?? "",
            });
            resetMutation();
        }
    }, [open, mission, consultant, reset, resetMutation]);

    // Mission sélectionnée : sert à afficher sa période comme aide à la saisie.
    const selectedMissionId = useWatch({ control, name: "missionId" });
    const selectedMission =
        mission ?? missionsQuery.data?.content.find((m) => String(m.id) === selectedMissionId);

    const onSubmit = (values: AssignmentFormValues) => {
        mutate({
            consultantId: Number(values.consultantId),
            missionId: Number(values.missionId),
            role: values.role || null,
            startDate: values.startDate,
            endDate: values.endDate,
        });
    };

    // Les erreurs métier (409 chevauchement, 400 hors période...) s'affichent en haut du formulaire.
    const globalError = error && !getFieldErrors(error) ? getErrorMessage(error) : null;

    return (
        <Modal open={open} onClose={onClose} title="Nouvelle affectation">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {consultant ? (
                    <p className="text-sm text-slate-700">
                        Consultant : <span className="font-medium text-slate-900">{consultant.name}</span>
                    </p>
                ) : (
                    <Field label="Consultant" htmlFor="consultantId" error={errors.consultantId?.message}>
                        <select id="consultantId" {...register("consultantId")} className={inputClassName}>
                            <option value="">Choisir…</option>
                            {consultantsQuery.data?.content.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.firstName} {c.lastName} — {c.jobTitle}
                                </option>
                            ))}
                        </select>
                    </Field>
                )}

                {mission ? (
                    <p className="text-sm text-slate-700">
                        Mission : <span className="font-medium text-slate-900">{mission.title}</span> ({mission.clientName})
                    </p>
                ) : (
                    <Field label="Mission" htmlFor="missionId" error={errors.missionId?.message}>
                        <select id="missionId" {...register("missionId")} className={inputClassName}>
                            <option value="">Choisir…</option>
                            {missionsQuery.data?.content
                                .filter((m) => m.status !== "CLOSED")
                                .map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.title} — {m.clientName}
                                    </option>
                                ))}
                        </select>
                    </Field>
                )}

                {selectedMission && (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        Période de la mission : {formatDate(selectedMission.startDate)} → {formatDate(selectedMission.endDate)}
                    </p>
                )}

                <Field label="Rôle (facultatif)" htmlFor="role" error={errors.role?.message}>
                    <input id="role" {...register("role")} placeholder="Développeur back" className={inputClassName} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Début" htmlFor="startDate" error={errors.startDate?.message}>
                        <input id="startDate" type="date" {...register("startDate")} className={inputClassName} />
                    </Field>
                    <Field label="Fin" htmlFor="endDate" error={errors.endDate?.message}>
                        <input id="endDate" type="date" {...register("endDate")} className={inputClassName} />
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
                        {isPending ? "Affectation…" : "Affecter"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}