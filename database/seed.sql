-- Mesas iniciais do protótipo (16 mesas; 13 e 14 na área externa).
-- Equivale a: python manage.py criar_mesas
-- Rode depois de: python manage.py migrate
INSERT INTO reservas_mesa (numero, capacidade, area, ativa, situacao, criado_em, atualizado_em) VALUES
    (1, 2, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (2, 2, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (3, 4, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (4, 4, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (5, 4, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (6, 4, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (7, 2, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (8, 2, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (9, 2, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (10, 2, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (11, 2, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (12, 2, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (13, 4, 'externa', TRUE, 'disponivel', NOW(), NOW()),
    (14, 4, 'externa', TRUE, 'disponivel', NOW(), NOW()),
    (15, 4, 'interna', TRUE, 'disponivel', NOW(), NOW()),
    (16, 4, 'interna', TRUE, 'disponivel', NOW(), NOW())
ON CONFLICT (numero) DO NOTHING;
