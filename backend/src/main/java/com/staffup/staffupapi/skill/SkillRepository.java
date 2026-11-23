package com.staffup.staffupapi.skill;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    boolean existsByNameIgnoreCase(String name);

    List<Skill> findAllByOrderByNameAsc();

    List<Skill> findByCategoryOrderByNameAsc(SkillCategory category);

    Optional<Skill> findByNameIgnoreCase(String name);
}