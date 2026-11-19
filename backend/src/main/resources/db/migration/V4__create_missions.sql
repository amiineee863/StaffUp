CREATE TABLE mission (
                         id           BIGSERIAL PRIMARY KEY,
                         title        VARCHAR(150)  NOT NULL,
                         client_name  VARCHAR(150)  NOT NULL,
                         description  VARCHAR(5000),
                         start_date   DATE          NOT NULL,
                         end_date     DATE,
                         status       VARCHAR(20)   NOT NULL,
                         created_at   TIMESTAMP WITH TIME ZONE NOT NULL,
                         updated_at   TIMESTAMP WITH TIME ZONE NOT NULL,
                         CONSTRAINT ck_mission_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE mission_skill (
                               mission_id  BIGINT NOT NULL REFERENCES mission(id) ON DELETE CASCADE,
                               skill_id    BIGINT NOT NULL REFERENCES skill(id) ON DELETE CASCADE,
                               PRIMARY KEY (mission_id, skill_id)
);

-- Données de démo (clients fictifs)
INSERT INTO mission (title, client_name, description, start_date, end_date, status, created_at, updated_at) VALUES
                                                                                                                ('Refonte API catalogue produits', 'Retail Nord',
                                                                                                                 'Refonte des API du catalogue produits d''une enseigne de distribution, passage en architecture événementielle.',
                                                                                                                 '2027-01-04', '2027-06-30', 'OPEN', now(), now()),
                                                                                                                ('Portail client React', 'Assurances des Flandres',
                                                                                                                 'Développement d''un portail client permettant la consultation des contrats et la déclaration de sinistres.',
                                                                                                                 '2027-02-01', '2027-07-31', 'OPEN', now(), now()),
                                                                                                                ('Migration Kubernetes', 'LogiTrans',
                                                                                                                 'Migration de l''infrastructure applicative vers un cluster Kubernetes managé.',
                                                                                                                 '2026-10-01', '2027-03-31', 'STAFFED', now(), now());

INSERT INTO mission_skill (mission_id, skill_id)
SELECT m.id, s.id
FROM (VALUES
          ('Refonte API catalogue produits', 'Java'),
          ('Refonte API catalogue produits', 'Spring Boot'),
          ('Refonte API catalogue produits', 'PostgreSQL'),
          ('Refonte API catalogue produits', 'Kafka'),
          ('Portail client React', 'React'),
          ('Portail client React', 'TypeScript'),
          ('Portail client React', 'Spring Boot'),
          ('Migration Kubernetes', 'Kubernetes'),
          ('Migration Kubernetes', 'Docker'),
          ('Migration Kubernetes', 'AWS')
     ) AS v(title, skill)
         JOIN mission m ON m.title = v.title
         JOIN skill s ON s.name = v.skill;