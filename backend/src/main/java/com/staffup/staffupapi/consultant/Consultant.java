package com.staffup.staffupapi.consultant;

import com.staffup.staffupapi.common.AuditableEntity;
import com.staffup.staffupapi.skill.Skill;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "consultant")
@Getter
@Setter
@NoArgsConstructor
public class Consultant extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "job_title", nullable = false, length = 150)
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Seniority seniority;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "consultant", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ConsultantSkill> skills = new HashSet<>();

    /** Ajoute la compétence, ou met à jour son niveau si le consultant l'a déjà. */
    public void setSkillLevel(Skill skill, int level) {
        skills.stream()
                .filter(cs -> cs.getSkill().getId().equals(skill.getId()))
                .findFirst()
                .ifPresentOrElse(
                        cs -> cs.setLevel(level),
                        () -> skills.add(new ConsultantSkill(this, skill, level))
                );
    }

    /** @return true si la compétence a été retirée, false si le consultant ne l'avait pas. */
    public boolean removeSkill(Long skillId) {
        return skills.removeIf(cs -> cs.getSkill().getId().equals(skillId));
    }
}