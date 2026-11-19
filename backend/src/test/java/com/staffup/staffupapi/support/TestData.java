package com.staffup.staffupapi.support;

import com.staffup.staffupapi.assignment.Assignment;
import com.staffup.staffupapi.consultant.Consultant;
import com.staffup.staffupapi.consultant.Seniority;
import com.staffup.staffupapi.mission.Mission;
import com.staffup.staffupapi.mission.MissionStatus;

import java.time.LocalDate;

/** Fabriques d'objets pour les tests (pattern "Object Mother"). */
public final class TestData {

    private TestData() {
    }

    public static Consultant consultant(String email) {
        Consultant c = new Consultant();
        c.setFirstName("Test");
        c.setLastName("Consultant");
        c.setEmail(email);
        c.setJobTitle("Développeur");
        c.setSeniority(Seniority.JUNIOR);
        return c;
    }

    public static Mission mission(String title, LocalDate start, LocalDate end) {
        Mission m = new Mission();
        m.setTitle(title);
        m.setClientName("Client Test");
        m.setStartDate(start);
        m.setEndDate(end);
        m.setStatus(MissionStatus.OPEN);
        return m;
    }

    public static Assignment assignment(Consultant consultant, Mission mission, LocalDate start, LocalDate end) {
        Assignment a = new Assignment();
        a.setConsultant(consultant);
        a.setMission(mission);
        a.setStartDate(start);
        a.setEndDate(end);
        return a;
    }
}