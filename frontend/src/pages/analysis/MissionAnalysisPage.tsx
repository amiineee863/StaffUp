import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { FilePlus2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { analysisApi } from "../../api/analysis";
import type { MissionAnalysisRequest } from "../../api/types";
import { ConsultantMatchRow } from "../../components/ConsultantMatchRow";
import { Spinner } from "../../components/Spinner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { Field } from "../../components/ui/Field";
import { PageHeader } from "../../components/ui/PageHeader";
import { inputClassName } from "../../components/ui/styles";
import { MissionFormModal, type MissionDraft } from "../missions/MissionFormModal";

const EXAMPLE = `Notre client, enseigne de distribution des Hauts-de-France, recherche un développeur back-end confirmé pour la refonte de ses API catalogue.

Environnement technique : Java 21, Spring Boot, base Postgres. Les services communiquent via Kafka et sont déployés sur k8s. Une connaissance de Quarkus serait un plus.

Équipe agile (Scrum). Démarrage en janvier pour 6 mois.`;

const analysisSchema = z
    .object({
        description: z
            .string()
            .trim()
            .min(20, "Collez une fiche de mission (20 caractères minimum)")
            .max(5000, "5000 caractères maximum"),
        startDate: z.string(),
        endDate: z.string(),
    })
    .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
        message: "La date de fin doit être postérieure ou égale à la date de début",
        path: ["endDate"],
    });

type AnalysisFormValues = z.infer<typeof analysisSchema>;

export default function MissionAnalysisPage() {
    const navigate = useNavigate();
    const [lastRequest, setLastRequest] = useState<MissionAnalysisRequest | null>(null);
    const [draft, setDraft] = useState<MissionDraft | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<AnalysisFormValues>({
        resolver: zodResolver(analysisSchema),
        defaultValues: { description: "", startDate: "", endDate: "" },
    });

    const analysis = useMutation({ mutationFn: analysisApi.analyze });

    const onSubmit = (values: AnalysisFormValues) => {
        const request: MissionAnalysisRequest = {
            description: values.description,
            startDate: values.startDate || null,
            endDate: values.endDate || null,
        };
        setLastRequest(request);
        analysis.mutate(request);
    };

    const openMissionForm = () => {
        if (!analysis.data || !lastRequest) return;
        setDraft({
            description: lastRequest.description,
            startDate: lastRequest.startDate ?? "",
            endDate: lastRequest.endDate ?? "",
            requiredSkillIds: analysis.data.skills.map((s) => s.id),
        });
    };

    const result = analysis.data;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Analyse IA"
                description="Collez la fiche de mission envoyée par le client : les compétences sont extraites et les meilleurs profils proposés."
            />

            <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <Field label="Fiche de mission" htmlFor="description" error={errors.description?.message}>
            <textarea
                id="description"
                rows={8}
                {...register("description")}
                placeholder="Collez ici le texte de la fiche de mission…"
                className={inputClassName}
            />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="Début (facultatif)" htmlFor="startDate" error={errors.startDate?.message}>
                            <input id="startDate" type="date" {...register("startDate")} className={inputClassName} />
                        </Field>
                        <Field label="Fin (facultatif)" htmlFor="endDate" error={errors.endDate?.message}>
                            <input id="endDate" type="date" {...register("endDate")} className={inputClassName} />
                        </Field>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button type="submit" icon={Sparkles} disabled={analysis.isPending}>
                            {analysis.isPending ? "Analyse en cours…" : "Analyser"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setValue("description", EXAMPLE, { shouldValidate: true });
                                setValue("startDate", "2027-01-04");
                                setValue("endDate", "2027-06-30");
                            }}
                        >
                            Utiliser un exemple
                        </Button>
                    </div>
                </form>
            </Card>

            {analysis.isPending && (
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Spinner /> L'IA analyse la fiche… (le premier appel peut prendre quelques secondes)
                </div>
            )}

            {analysis.isError && <ErrorMessage error={analysis.error} />}

            {result && !analysis.isPending && (
                <>
                    <Card
                        title="Compétences identifiées"
                        actions={
                            <Badge tone={result.engine === "LLM" ? "indigo" : "slate"}>
                                {result.engine === "LLM" ? "Analyse IA" : "Analyse par mots-clés"}
                            </Badge>
                        }
                    >
                        {result.summary && <p className="mb-4 text-sm italic text-slate-600">« {result.summary} »</p>}

                        {result.skills.length === 0 ? (
                            <p className="text-sm text-slate-500">Aucune compétence du référentiel n'a été reconnue.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {result.skills.map((skill) => (
                                    <Badge key={skill.id} tone="indigo">
                                        {skill.name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {result.otherSkills.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-medium text-slate-500">Hors référentiel (non utilisées pour le matching) :</p>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {result.otherSkills.map((name) => (
                                        <Badge key={name}>{name}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {result.engine === "KEYWORDS" && (
                            <p className="mt-4 text-xs text-slate-400">
                                L'IA est désactivée ou indisponible : les compétences ont été trouvées par recherche de mots-clés.
                            </p>
                        )}
                    </Card>

                    <Card
                        title="Consultants recommandés"
                        actions={
                            result.skills.length > 0 && (
                                <Button icon={FilePlus2} onClick={openMissionForm}>
                                    Créer la mission
                                </Button>
                            )
                        }
                    >
                        {result.matches.length === 0 ? (
                            <p className="text-sm text-slate-500">Aucun consultant ne correspond.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {result.matches.map((match) => (
                                    <ConsultantMatchRow key={match.consultantId} match={match} />
                                ))}
                            </ul>
                        )}
                    </Card>
                </>
            )}

            <MissionFormModal
                open={draft !== null}
                onClose={() => setDraft(null)}
                draft={draft ?? undefined}
                onSaved={(mission) => navigate(`/missions/${mission.id}`)}
            />
        </div>
    );
}