package com.staffup.staffupapi.ai;

import java.util.List;

/** Extrait d'un texte libre les compétences présentes dans le référentiel. */
public interface SkillExtractor {

    SkillExtraction extract(String text, List<String> skillCatalog);
}