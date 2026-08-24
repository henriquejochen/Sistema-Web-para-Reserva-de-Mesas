-- Modelo inicial para PostgreSQL. Será refinado durante o desenvolvimento.

CREATE TABLE usuarios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  telefone VARCHAR(20) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'cliente'
    CHECK (tipo IN ('cliente', 'administrador')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mesas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  numero INTEGER NOT NULL UNIQUE,
  capacidade INTEGER NOT NULL CHECK (capacidade > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'ativa'
    CHECK (status IN ('ativa', 'inativa', 'manutencao'))
);

CREATE TABLE reservas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  mesa_id BIGINT NOT NULL REFERENCES mesas(id),
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ NOT NULL,
  quantidade_pessoas INTEGER NOT NULL CHECK (quantidade_pessoas > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'confirmada', 'concluida', 'cancelada')),
  observacoes VARCHAR(500),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (fim > inicio)
);

CREATE INDEX idx_reservas_mesa_inicio_fim
  ON reservas (mesa_id, inicio, fim);

-- O back-end deverá validar a capacidade da mesa e impedir sobreposição
-- de horários para reservas pendentes ou confirmadas.

