package com.staffup.staffupapi.dashboard;

import com.staffup.staffupapi.assignment.Assignment;
import com.staffup.staffupapi.consultant.Consultant;
import com.staffup.staffupapi.dashboard.projection.SkillDemand;
import com.staffup.staffupapi.dashboard.projection.SkillSupply;
import com.staffup.staffupapi.dashboard.projection.StatusCount;
import com.staffup.staffupapi.mission.Mission;
import com.staffup.staffupapi.mission.MissionStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * Requêtes de lecture dédiées au dashboard.
 * On étend Repository (et non JpaRepository) : uniquement les méthodes déclarées ici, aucune écriture.
 */
public interface DashboardQueries extends Repository<Mission, Long> {

    @Query("select count(c) from Consultant c")
    long countConsultants();

    /** Consultants sans aucune affectation en cours à la date donnée (« intercontrat »). */
    @Query("""
            select c from Consultant c
            where not exists (
                select a from Assignment a
                where a.consultant = c
                  and a.startDate <= :date
                  and a.endDate >= :date
            )
            order by c.lastName, c.firstName
            """)
    List<Consultant> findConsultantsOnBench(@Param("date") LocalDate date);

    @Query("""
            select new com.staffup.staffupapi.dashboard.projection.StatusCount(m.status, count(m))
            from Mission m
            group by m.status
            """)
    List<StatusCount> countMissionsByStatus();

    @Query("""
            select a from Assignment a
            join fetch a.consultant
            join fetch a.mission
            where a.endDate between :from and :to
            order by a.endDate
            """)
    List<Assignment> findAssignmentsEndingBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("""
            select new com.staffup.staffupapi.dashboard.projection.SkillDemand(s.id, s.name, count(m))
            from Mission m
            join m.requiredSkills s
            where m.status = :status
            group by s.id, s.name
            order by count(m) desc, s.name
            """)
    List<SkillDemand> findSkillDemand(@Param("status") MissionStatus status);

    @Query("""
            select new com.staffup.staffupapi.dashboard.projection.SkillSupply(cs.skill.id, count(cs))
            from ConsultantSkill cs
            group by cs.skill.id
            """)
    List<SkillSupply> countConsultantsBySkill();
}