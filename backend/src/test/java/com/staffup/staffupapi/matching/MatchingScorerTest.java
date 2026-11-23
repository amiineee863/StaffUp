package com.staffup.staffupapi.matching;

import com.staffup.staffupapi.consultant.Consultant;
import com.staffup.staffupapi.matching.dto.MatchResult;
import com.staffup.staffupapi.matching.dto.MatchedSkill;
import com.staffup.staffupapi.skill.Skill;
import com.staffup.staffupapi.skill.SkillCategory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MatchingScorerTest {

    private final MatchingScorer scorer = new MatchingScorer();

    private final Skill java = skill(1L, "Java");
    private final Skill spring = skill(2L, "Spring Boot");
    private final Skill react = skill(3L, "React");
    private final Skill docker = skill(4L, "Docker");

    @Test
    @DisplayName("toutes les compétences au niveau maximum : score 100")
    void fullCoverageAtMaxLevel_scores100() {
        Consultant c = consultant();
        c.setSkillLevel(java, 5);
        c.setSkillLevel(spring, 5);

        MatchResult result = scorer.score(c, List.of(java, spring));

        assertThat(result.score()).isEqualTo(100);
        assertThat(result.missingSkills()).isEmpty();
    }

    @Test
    @DisplayName("couverture partielle : score proportionnel et compétences manquantes listées")
    void partialCoverage_listsMissingSkills() {
        Consultant c = consultant();
        c.setSkillLevel(java, 4);

        MatchResult result = scorer.score(c, List.of(java, spring));

        assertThat(result.score()).isEqualTo(40); // (4 + 0) / (2 x 5)
        assertThat(result.matchedSkills()).containsExactly(new MatchedSkill("Java", 4));
        assertThat(result.missingSkills()).containsExactly("Spring Boot");
    }

    @Test
    @DisplayName("un niveau plus élevé donne un meilleur score")
    void higherLevel_scoresHigher() {
        Consultant expert = consultant();
        expert.setSkillLevel(java, 5);
        Consultant beginner = consultant();
        beginner.setSkillLevel(java, 2);

        assertThat(scorer.score(expert, List.of(java)).score()).isEqualTo(100);
        assertThat(scorer.score(beginner, List.of(java)).score()).isEqualTo(40);
    }

    @Test
    @DisplayName("aucune compétence en commun : score 0")
    void noCommonSkill_scoresZero() {
        Consultant c = consultant();
        c.setSkillLevel(react, 5);

        MatchResult result = scorer.score(c, List.of(java));

        assertThat(result.score()).isZero();
        assertThat(result.missingSkills()).containsExactly("Java");
    }

    @Test
    @DisplayName("les compétences non demandées n'influencent pas le score")
    void extraSkills_doNotAffectScore() {
        Consultant c = consultant();
        c.setSkillLevel(java, 5);
        c.setSkillLevel(react, 5);
        c.setSkillLevel(docker, 5);

        assertThat(scorer.score(c, List.of(java)).score()).isEqualTo(100);
    }

    @Test
    @DisplayName("refuse une liste de compétences requises vide")
    void emptyRequiredSkills_throws() {
        assertThatThrownBy(() -> scorer.score(consultant(), List.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private static Consultant consultant() {
        return new Consultant();
    }

    private static Skill skill(Long id, String name) {
        Skill s = new Skill();
        s.setId(id);
        s.setName(name);
        s.setCategory(SkillCategory.BACKEND);
        return s;
    }
}