CREATE TABLE assignment (
                            id             BIGSERIAL PRIMARY KEY,
                            consultant_id  BIGINT       NOT NULL REFERENCES consultant(id) ON DELETE CASCADE,
                            mission_id     BIGINT       NOT NULL REFERENCES mission(id) ON DELETE CASCADE,
                            role           VARCHAR(100),
                            start_date     DATE         NOT NULL,
                            end_date       DATE         NOT NULL,
                            created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
                            updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
                            CONSTRAINT ck_assignment_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_assignment_consultant ON assignment(consultant_id);
CREATE INDEX idx_assignment_mission ON assignment(mission_id);

-- Données de démo : Thomas et Inès sont sur la mission "Migration Kubernetes" (STAFFED)
INSERT INTO assignment (consultant_id, mission_id, role, start_date, end_date, created_at, updated_at)
SELECT c.id, m.id, v.role, v.start_date::date, v.end_date::date, now(), now()
FROM (VALUES
          ('thomas.dubois@staffup.dev', 'Migration Kubernetes', 'Architecte',       '2026-10-01', '2027-02-14'),
          ('ines.moreau@staffup.dev',   'Migration Kubernetes', 'Ingénieure DevOps', '2026-10-01', '2026-12-14')
     ) AS v(email, title, role, start_date, end_date)
         JOIN consultant c ON c.email = v.email
         JOIN mission m ON m.title = v.title;