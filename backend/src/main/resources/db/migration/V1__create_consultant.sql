CREATE TABLE consultant (
                            id              BIGSERIAL PRIMARY KEY,
                            first_name      VARCHAR(100) NOT NULL,
                            last_name       VARCHAR(100) NOT NULL,
                            email           VARCHAR(255) NOT NULL,
                            job_title       VARCHAR(150) NOT NULL,
                            seniority       VARCHAR(20)  NOT NULL,
                            available_from  DATE,
                            created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
                            updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
                            CONSTRAINT uk_consultant_email UNIQUE (email)
);