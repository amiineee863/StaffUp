package com.staffup.staffupapi.assignment;

import com.staffup.staffupapi.assignment.dto.AssignmentRequest;
import com.staffup.staffupapi.assignment.dto.AssignmentResponse;
import com.staffup.staffupapi.consultant.ConsultantService;
import com.staffup.staffupapi.mission.MissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssignmentService {

    private final AssignmentRepository repository;
    private final ConsultantService consultantService;
    private final MissionService missionService;

    @Transactional
    public AssignmentResponse create(AssignmentRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    @Transactional
    public void delete(Long id) {
        throw new UnsupportedOperationException("TODO");
    }

    public List<AssignmentResponse> findAll(Long consultantId, Long missionId) {
        throw new UnsupportedOperationException("TODO");
    }

    public AssignmentResponse findById(Long id) {
        throw new UnsupportedOperationException("TODO");
    }
}