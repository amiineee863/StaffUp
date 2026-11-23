package com.staffup.staffupapi.consultant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ConsultantRepository extends JpaRepository<Consultant, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    Page<Consultant> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName, Pageable pageable);
    @Query("""
            select distinct c from Consultant c
            join c.skills cs
            where cs.skill.id in :skillIds
            """)
    List<Consultant> findDistinctBySkillIds(@Param("skillIds") Collection<Long> skillIds);
}