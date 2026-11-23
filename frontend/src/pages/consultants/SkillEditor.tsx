import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { consultantsApi } from "../../api/consultants";
import { queryKeys } from "../../api/queryKeys";
import { skillsApi } from "../../api/skills";
import type { Consultant, Skill, SkillCategory } from "../../api/types";
import { Button } from "../../components/ui/Button";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { LevelBar } from "../../components/ui/LevelBar";
import { inputClassName } from "../../components/ui/styles";
import { SKILL_CATEGORY_LABELS } from "../../lib/format";

const LEVELS = [1, 2, 3, 4, 5];

interface SkillEditorProps {
    consultant: Consultant;
    canEdit: boolean;
}

export function SkillEditor({ consultant, canEdit }: SkillEditorProps) {
    const queryClient = useQueryClient();
    const [newSkillId, setNewSkillId] = useState("");
    const [newLevel, setNewLevel] = useState(3);

    // Le référentiel complet n'est chargé que si l'utilisateur peut modifier.
    const { data: allSkills = [] } = useQuery({
        queryKey: queryKeys.skills.all,
        queryFn: skillsApi.list,
        enabled: canEdit,
        staleTime: 5 * 60_000,
    });

    // Compétences que le consultant n'a pas encore, groupées par catégorie.
    const availableByCategory = useMemo(() => {
        const owned = new Set(consultant.skills.map((s) => s.skillId));
        return allSkills
            .filter((skill) => !owned.has(skill.id))
            .reduce<Partial<Record<SkillCategory, Skill[]>>>((groups, skill) => {
                (groups[skill.category] ??= []).push(skill);
                return groups;
            }, {});
    }, [allSkills, consultant.skills]);

    const hasAvailableSkills = Object.keys(availableByCategory).length > 0;

    const onConsultantUpdated = (updated: Consultant) => {
        queryClient.setQueryData(queryKeys.consultants.detail(updated.id), updated);
        queryClient.invalidateQueries({ queryKey: queryKeys.consultants.lists });
    };

    const setSkill = useMutation({
        mutationFn: ({ skillId, level }: { skillId: number; level: number }) =>
            consultantsApi.setSkill(consultant.id, skillId, level),
        onSuccess: (updated) => {
            onConsultantUpdated(updated);
            setNewSkillId("");
        },
    });

    const removeSkill = useMutation({
        mutationFn: (skillId: number) => consultantsApi.removeSkill(consultant.id, skillId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.consultants.all }),
    });

    const mutationError = setSkill.error ?? removeSkill.error;

    return (
        <div className="space-y-4">
            {consultant.skills.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune compétence renseignée.</p>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {consultant.skills.map((skill) => (
                        <li key={skill.skillId} className="flex items-center justify-between gap-4 py-2">
                            <div>
                                <p className="text-sm font-medium text-slate-900">{skill.name}</p>
                                <p className="text-xs text-slate-500">{SKILL_CATEGORY_LABELS[skill.category]}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {canEdit ? (
                                    <select
                                        value={skill.level}
                                        onChange={(e) => setSkill.mutate({ skillId: skill.skillId, level: Number(e.target.value) })}
                                        disabled={setSkill.isPending}
                                        aria-label={`Niveau en ${skill.name}`}
                                        className={`${inputClassName} w-20 py-1`}
                                    >
                                        {LEVELS.map((level) => (
                                            <option key={level} value={level}>
                                                {level} / 5
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <LevelBar level={skill.level} />
                                )}
                                {canEdit && (
                                    <Button
                                        variant="ghost"
                                        icon={Trash2}
                                        onClick={() => removeSkill.mutate(skill.skillId)}
                                        disabled={removeSkill.isPending}
                                        aria-label={`Retirer ${skill.name}`}
                                    />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {canEdit && hasAvailableSkills && (
                <form
                    className="flex flex-wrap items-end gap-2 border-t border-slate-100 pt-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (newSkillId) setSkill.mutate({ skillId: Number(newSkillId), level: newLevel });
                    }}
                >
                    <select
                        value={newSkillId}
                        onChange={(e) => setNewSkillId(e.target.value)}
                        aria-label="Compétence à ajouter"
                        className={`${inputClassName} min-w-48 flex-1`}
                    >
                        <option value="">Ajouter une compétence…</option>
                        {(Object.keys(availableByCategory) as SkillCategory[]).map((category) => (
                            <optgroup key={category} label={SKILL_CATEGORY_LABELS[category]}>
                                {availableByCategory[category]?.map((skill) => (
                                    <option key={skill.id} value={skill.id}>
                                        {skill.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <select
                        value={newLevel}
                        onChange={(e) => setNewLevel(Number(e.target.value))}
                        aria-label="Niveau"
                        className={`${inputClassName} w-24`}
                    >
                        {LEVELS.map((level) => (
                            <option key={level} value={level}>
                                {level} / 5
                            </option>
                        ))}
                    </select>
                    <Button type="submit" icon={Plus} disabled={!newSkillId || setSkill.isPending}>
                        Ajouter
                    </Button>
                </form>
            )}

            {mutationError && <ErrorMessage error={mutationError} />}
        </div>
    );
}