package com.staffup.staffupapi.mission;

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
@Table(name = "mission")
@Getter
@Setter
@NoArgsConstructor
public class Mission extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "client_name", nullable = false, length = 150)
    private String clientName;

    @Column(length = 5000)
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MissionStatus status;

    @Setter(AccessLevel.NONE)
    @ManyToMany
    @JoinTable(
            name = "mission_skill",
            joinColumns = @JoinColumn(name = "mission_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skill> requiredSkills = new HashSet<>();
}