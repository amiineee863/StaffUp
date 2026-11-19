package com.staffup.staffupapi.consultant;

import com.staffup.staffupapi.skill.Skill;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "consultant_skill")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ConsultantSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consultant_id")
    private Consultant consultant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Setter
    @Column(nullable = false)
    private int level;

    ConsultantSkill(Consultant consultant, Skill skill, int level) {
        this.consultant = consultant;
        this.skill = skill;
        this.level = level;
    }
}