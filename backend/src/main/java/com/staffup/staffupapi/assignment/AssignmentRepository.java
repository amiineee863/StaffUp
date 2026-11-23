package com.staffup.staffupapi.assignment;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    /**
     * Deux périodes [A.start, A.end] et [B.start, B.end] se chevauchent
     * si et seulement si : A.start <= B.end ET A.end >= B.start.
     */
    @Query("""
            select case when count(a) > 0 then true else false end
            from Assignment a
            where a.consultant.id = :consultantId
              and a.startDate <= :endDate
              and a.endDate >= :startDate
            """)
    boolean existsOverlapping(@Param("consultantId") Long consultantId,
                              @Param("startDate") LocalDate startDate,
                              @Param("endDate") LocalDate endDate);

    boolean existsByMissionIdAndIdNot(Long missionId, Long excludedAssignmentId);

    @EntityGraph(attributePaths = {"consultant", "mission"})
    List<Assignment> findByConsultantIdOrderByStartDateAsc(Long consultantId);

    @EntityGraph(attributePaths = {"consultant", "mission"})
    List<Assignment> findByMissionIdOrderByStartDateAsc(Long missionId);

    @Override
    @EntityGraph(attributePaths = {"consultant", "mission"})
    List<Assignment> findAll(Sort sort);

    /** Ids des consultants ayant au moins une affectation qui chevauche [start, end]. */
    @Query("""
            select distinct a.consultant.id from Assignment a
            where a.startDate <= :end
              and a.endDate >= :start
            """)
    List<Long> findBusyConsultantIds(@Param("start") LocalDate start, @Param("end") LocalDate end);
}