CREATE TABLE app_user (
                          id             BIGSERIAL PRIMARY KEY,
                          email          VARCHAR(255) NOT NULL,
                          password_hash  VARCHAR(100) NOT NULL,
                          role           VARCHAR(20)  NOT NULL,
                          consultant_id  BIGINT REFERENCES consultant(id) ON DELETE SET NULL,
                          enabled        BOOLEAN      NOT NULL DEFAULT TRUE,
                          created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
                          updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
                          CONSTRAINT uk_app_user_email UNIQUE (email),
                          CONSTRAINT uk_app_user_consultant UNIQUE (consultant_id)
);

-- Comptes de démo. Mot de passe pour les 3 : Password123!
INSERT INTO app_user (email, password_hash, role, consultant_id, enabled, created_at, updated_at) VALUES
                                                                                                      ('admin@staffup.dev',   '$2a$10$L4YOuITZK9.trJlSOypslOrrswp7IpzThSDPhu91hIxeXJlFulfJC', 'ADMIN',   NULL, TRUE, now(), now()),
                                                                                                      ('manager@staffup.dev', '$2a$10$L4YOuITZK9.trJlSOypslOrrswp7IpzThSDPhu91hIxeXJlFulfJC', 'MANAGER', NULL, TRUE, now(), now());

INSERT INTO app_user (email, password_hash, role, consultant_id, enabled, created_at, updated_at)
SELECT 'sarah.lefebvre@staffup.dev', '$2a$10$L4YOuITZK9.trJlSOypslOrrswp7IpzThSDPhu91hIxeXJlFulfJC',
       'CONSULTANT', c.id, TRUE, now(), now()
FROM consultant c
WHERE c.email = 'sarah.lefebvre@staffup.dev';