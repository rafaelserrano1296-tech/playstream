export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'user' | 'admin';
  data_cadastro?: string;
}

export interface Filme {
  id: string;
  titulo: string;
  descricao?: string;
  capa_url?: string;
  tipo: 'filme' | 'serie';
  gratuito: boolean;
  valor: number;
  url_video?: string;
  destaque: boolean;
  lancamento: boolean;
  ano?: number;
  duracao?: string;
  classificacao?: string;
  avaliacao?: number;
  categoria_id?: string;
  categoria_nome?: string;
  ativo: boolean;
  criado_em: string;
}

export interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

export interface Compra {
  id: string;
  usuario_id: string;
  filme_id: string;
  valor_pago: number;
  status_pagamento: 'pendente' | 'aprovado' | 'cancelado' | 'expirado';
  txid?: string;
  pix_copia_cola?: string;
  qr_code_base64?: string;
  data_expiracao?: string;
  data_pagamento?: string;
  criado_em: string;
  titulo?: string;
  capa_url?: string;
}

export interface PagamentoPix {
  id: string;
  pix_copia_cola: string;
  qr_code_base64: string;
  data_expiracao: string;
  txid: string;
  valor_pago: number;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface ApiError {
  error: string;
}
