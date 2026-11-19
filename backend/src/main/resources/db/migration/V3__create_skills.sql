CREATE TABLE skill (
                       id        BIGSERIAL PRIMARY KEY,
                       name      VARCHAR(100) NOT NULL,
                       category  VARCHAR(30)  NOT NULL,
                       CONSTRAINT uk_skill_name UNIQUE (name)
);

CREATE TABLE consultant_skill (
                                  id             BIGSERIAL PRIMARY KEY,
                                  consultant_id  BIGINT  NOT NULL REFERENCES consultant(id) ON DELETE CASCADE,
                                  skill_id       BIGINT  NOT NULL REFERENCES skill(id) ON DELETE CASCADE,
                                  level          INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
                                  CONSTRAINT uk_consultant_skill UNIQUE (consultant_id, skill_id)
);

CREATE INDEX idx_consultant_skill_skill ON consultant_skill(skill_id);

-- Données de démo
INSERT INTO skill (name, category) VALUES
                                       ('Java', 'BACKEND'), ('Spring Boot', 'BACKEND'), ('Node.js', 'BACKEND'), ('Kafka', 'BACKEND'),
                                       ('React', 'FRONTEND'), ('Angular', 'FRONTEND'), ('TypeScript', 'FRONTEND'),
                                       ('PostgreSQL', 'DATABASE'), ('MongoDB', 'DATABASE'),
                                       ('Docker', 'DEVOPS'), ('Kubernetes', 'DEVOPS'), ('Jenkins', 'DEVOPS'),
                                       ('AWS', 'CLOUD'), ('Azure', 'CLOUD'),
                                       ('Python', 'DATA_AI'),
                                       ('Scrum', 'METHODOLOGY');

INSERT INTO consultant_skill (consultant_id, skill_id, level)
SELECT c.id, s.id, v.level
FROM (VALUES
          ('sarah.lefebvre@staffup.dev', 'Java', 4),
          ('sarah.lefebvre@staffup.dev', 'Spring Boot', 4),
          ('sarah.lefebvre@staffup.dev', 'PostgreSQL', 3),
          ('sarah.lefebvre@staffup.dev', 'Docker', 2),
          ('sarah.lefebvre@staffup.dev', 'Scrum', 3),
          ('karim.benali@staffup.dev', 'Java', 4),
          ('karim.benali@staffup.dev', 'Spring Boot', 4),
          ('karim.benali@staffup.dev', 'React', 4),
          ('karim.benali@staffup.dev', 'TypeScript', 4),
          ('karim.benali@staffup.dev', 'Docker', 3),
          ('karim.benali@staffup.dev', 'Kafka', 3),
          ('julie.martin@staffup.dev', 'React', 3),
          ('julie.martin@staffup.dev', 'TypeScript', 3),
          ('julie.martin@staffup.dev', 'Angular', 2),
          ('thomas.dubois@staffup.dev', 'AWS', 5),
          ('thomas.dubois@staffup.dev', 'Azure', 4),
          ('thomas.dubois@staffup.dev', 'Kubernetes', 5),
          ('thomas.dubois@staffup.dev', 'Docker', 5),
          ('thomas.dubois@staffup.dev', 'Java', 4),
          ('ines.moreau@staffup.dev', 'Docker', 4),
          ('ines.moreau@staffup.dev', 'Kubernetes', 4),
          ('ines.moreau@staffup.dev', 'Jenkins', 4),
          ('ines.moreau@staffup.dev', 'AWS', 3),
          ('ines.moreau@staffup.dev', 'Python', 3)
     ) AS v(email, skill, level)
         JOIN consultant c ON c.email = v.email
         JOIN skill s ON s.name = v.skill;