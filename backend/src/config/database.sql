-- =============================================
-- STREAMFLIX - Schema do Banco de Dados
-- PostgreSQL
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  ativo BOOLEAN DEFAULT true,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir categorias padrão
INSERT INTO categorias (nome, slug) VALUES
  ('Ação', 'acao'),
  ('Comédia', 'comedia'),
  ('Drama', 'drama'),
  ('Terror', 'terror'),
  ('Ficção Científica', 'ficcao-cientifica'),
  ('Romance', 'romance'),
  ('Animação', 'animacao'),
  ('Documentário', 'documentario'),
  ('Thriller', 'thriller'),
  ('Aventura', 'aventura');

-- Tabela de Filmes/Séries
CREATE TABLE filmes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  capa_url VARCHAR(500),
  tipo VARCHAR(20) DEFAULT 'filme' CHECK (tipo IN ('filme', 'serie')),
  gratuito BOOLEAN DEFAULT true,
  valor DECIMAL(10,2) DEFAULT 0.00,
  url_video VARCHAR(500),
  destaque BOOLEAN DEFAULT false,
  lancamento BOOLEAN DEFAULT false,
  ano INTEGER,
  duracao VARCHAR(50),
  classificacao VARCHAR(10),
  avaliacao DECIMAL(3,1) DEFAULT 0.0,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Compras/Pagamentos
CREATE TABLE compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  filme_id UUID NOT NULL REFERENCES filmes(id) ON DELETE CASCADE,
  valor_pago DECIMAL(10,2) NOT NULL,
  status_pagamento VARCHAR(30) DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'aprovado', 'cancelado', 'expirado')),
  txid VARCHAR(255) UNIQUE,
  pix_copia_cola TEXT,
  qr_code_base64 TEXT,
  data_expiracao TIMESTAMP,
  data_pagamento TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_filmes_tipo ON filmes(tipo);
CREATE INDEX idx_filmes_gratuito ON filmes(gratuito);
CREATE INDEX idx_filmes_destaque ON filmes(destaque);
CREATE INDEX idx_filmes_lancamento ON filmes(lancamento);
CREATE INDEX idx_filmes_categoria ON filmes(categoria_id);
CREATE INDEX idx_compras_usuario ON compras(usuario_id);
CREATE INDEX idx_compras_filme ON compras(filme_id);
CREATE INDEX idx_compras_status ON compras(status_pagamento);
CREATE INDEX idx_compras_txid ON compras(txid);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_usuarios_updated
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_filmes_updated
  BEFORE UPDATE ON filmes
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Admin padrão (senha: Admin@123 - TROQUE EM PRODUÇÃO)
-- bcrypt hash de 'Admin@123'
INSERT INTO usuarios (nome, email, senha, role) VALUES
  ('Administrador', 'admin@streamflix.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
