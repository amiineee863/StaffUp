import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage, getFieldErrors } from "../../api/errors";
import { missionsApi } from "../../api/missions";
import { queryKeys } from "../../api/queryKeys";
import { skillsApi } from "../../api/skills";
import type { Mission, MissionRequest, Skill, SkillCategory } from "../../api/types";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { inputClassName } from "../../components/ui/styles";
import { MISSION_STATUSES, MISSION_STATUS_LABELS, SKILL_CATEGORY_LABELS } from "../../lib/format";

const missionSchema = z
    .object({
        title: z.string().trim().min(1, "Le titre est obligatoire").max(150, "150 caractères maximum"),
        clientName: z.string().trim().min(1, "Le client est obligatoire").max(150, "150 caractères maximum"),
        description: z.string().max(5000, "5000 caractères maximum"),
        startDate: z.string().min(1, "La date de début est obligatoire"),
        endDate: z.string(),
        status: z.enum(["OPEN", "STAFFED", "CLOSED"]),
        requiredSkillIds: z.array(z.string()),
    })
    .refine((v) => !v.endDate || !v.startDate || v.endDate >= v.startDate, {
        message: "La date de fin doit être postérieure ou égale à la date de début",
        path: ["endDate"],
    });

type MissionFormValues = z.infer<typeof missionSchema>;

function toFormValues(mission?: Mission): MissionFormValues {
    return {
        title: mission?.title ?? "",
        clientName: mission?.clientName ?? "",
        description: mission?.description ?? "",
        startDate: mission?.startDate ?? "",
        endDate: mission?.endDate ?? "",
        status: mission?.status ?? "OPEN",
        requiredSkillIds: mission?.requiredSkills.map((s) => String(s.id)) ?? [],
    };
}

interface MissionFormModalProps {
    open: boolean;
    onClose: () => void;
    mission?: Mission;
    onSaved?: (mission: Mission) => void;
}

export function MissionFormModal({ open, onClose, mission, onSaved }: MissionFormModalProps) {
    const queryClient = useQueryClient();
    const isEdit = mission !== undefined;

    const { data: skills = [] } = useQuery({
        queryKey: queryKeys.skills.all,
        queryFn: skillsApi.list,
        enabled: open,
        staleTime: 5 * 60_000,
    });

    const skillsByCategory = useMemo(
        () =>
            skills.reduce<Partial<Record<SkillCategory, Skill[]>>>((groups, skill) => {
                (groups[skill.category] ??= []).push(skill);
                return groups;
            }, {}),
        [skills],
    );

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<MissionFormValues>({
        resolver: zodResolver(missionSchema),
        defaultValues: toFormValues(mission),
    });

    const {
        mutate,
        isPending,
        error,
        reset: resetMutation,
    } = useMutation({
        mutationFn: (body: MissionRequest) =>
            mission ? missionsApi.update(mission.id, body) : missionsApi.create(body),
        onSuccess: (saved) => {
            queryClient.setQueryData(queryKeys.missions.detail(saved.id), saved);
            queryClient.invalidateQueries({ queryKey: queryKeys.missions.lists });
            queryClient.invalidateQueries({ queryKey: queryKeys.missions.matches(saved.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            onSaved?.(saved);
            onClose();
        },
        onError: (err) => {
            const fieldErrors = getFieldErrors(err);
            if (fieldErrors) {
                for (const [field, message] of Object.entries(fieldErrors)) {
                    setError(field as keyof MissionFormValues, { message });
                }
            }
        },
    });

    useEffect(() => {
        if (open) {
            reset(toFormValues(mission));
            resetMutation();
        }
    }, [open, mission, reset, resetMutation]);

    const onSubmit = (values: MissionFormValues) => {
        mutate({
            title: values.title,
            clientName: values.clientName,
            description: values.description.trim() || null,
            startDate: values.startDate,
            endDate: values.endDate || null,
            status: isEdit ? values.status : undefined, // à la création, l'API met OPEN par défaut
            requiredSkillIds: values.requiredSkillIds.map(Number),
        });
    };

    const globalError = error && !getFieldErrors(error) ? getErrorMessage(error) : null;

    return (
        <Modal open={open} onClose={onClose} title={isEdit ? "Modifier la mission" : "Nouvelle mission"}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Field label="Titre" htmlFor="title" error={errors.title?.message}>
                    <input id="title" {...register("title")} className={inputClassName} />
                </Field>

                <Field label="Client" htmlFor="clientName" error={errors.clientName?.message}>
                    <input id="clientName" {...register("clientName")} className={inputClassName} />
                </Field>

                <Field label="Description" htmlFor="description" error={errors.description?.message}>
                    <textarea id="description" rows={3} {...register("description")} className={inputClassName} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Début" htmlFor="startDate" error={errors.startDate?.message}>
                        <input id="startDate" type="date" {...register("startDate")} className={inputClassName} />
                    </Field>
                    <Field label="Fin (facultatif)" htmlFor="endDate" error={errors.endDate?.message}>
                        <input id="endDate" type="date" {...register("endDate")} className={inputClassName} />
                    </Field>
                </div>

                {isEdit && (
                    <Field label="Statut" htmlFor="status" error={errors.status?.message}>
                        <select id="status" {...register("status")} className={inputClassName}>
                            {MISSION_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {MISSION_STATUS_LABELS[s]}
                                </option>
                            ))}
                        </select>
                    </Field>
                )}

                <fieldset>
                    <legend className="text-sm font-medium text-slate-700">Compétences requises</legend>
                    <div className="mt-2 max-h-56 space-y-3 overflow-y-auto rounded-lg border border-slate-200 p-3">
                        {(Object.keys(skillsByCategory) as SkillCategory[]).map((category) => (
                            <div key={category}>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    {SKILL_CATEGORY_LABELS[category]}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                    {skillsByCategory[category]?.map((skill) => (
                                        <label key={skill.id} className="flex items-center gap-1.5 text-sm text-slate-700">
                                            <input
                                                type="checkbox"
                                                value={String(skill.id)}
                                                {...register("requiredSkillIds")}
                                                className="rounded border-slate-300 text-indigo-600"
                                            />
                                            {skill.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </fieldset>

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