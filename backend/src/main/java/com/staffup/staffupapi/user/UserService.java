package com.staffup.staffupapi.user;

import com.staffup.staffupapi.common.exception.BusinessRuleException;
import com.staffup.staffupapi.common.exception.ConflictException;
import com.staffup.staffupapi.consultant.ConsultantService;
import com.staffup.staffupapi.user.dto.CreateUserRequest;
import com.staffup.staffupapi.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final ConsultantService consultantService;

    public List<UserResponse> findAll() {
        return repository.findAll(Sort.by("email")).stream().map(UserResponse::from).toList();
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        String email = request.email().toLowerCase();
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Un compte existe déjà avec l'email " + email);
        }
        if (request.role() == Role.CONSULTANT && request.consultantId() == null) {
            throw new BusinessRuleException("Un compte CONSULTANT doit être lié à une fiche consultant");
        }

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());

        if (request.consultantId() != null) {
            if (repository.existsByConsultantId(request.consultantId())) {
                throw new ConflictException("Cette fiche consultant est déjà liée à un compte");
            }
            user.setConsultant(consultantService.getEntity(request.consultantId()));
        }
        return UserResponse.from(repository.save(user));
    }
}