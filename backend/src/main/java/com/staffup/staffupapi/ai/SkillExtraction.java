package com.staffup.staffupapi.ai;

import java.util.List;

/**
 * Résultat d'une extraction.
 * @param skills      noms EXACTS du référentiel (déjà filtrés)
 * @param otherSkills compétences demandées mais absentes du référentiel
 * @param summary     résumé du besoin (null si le moteur n'en produit pas)
 */
public record SkillExtraction(List<String> skills, List<String> otherSkills, String summary, ExtractionEngine engine) {
}