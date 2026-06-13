import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sf_token');
      localStorage.removeItem('sf_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authAPI = {
  login: (email: string, senha: string) =>
    api.post('/auth/login', { email, senha }),
  cadastrar: (nome: string, email: string, senha: string) =>
    api.post('/auth/cadastrar', { nome, email, senha }),
  solicitarReset: (email: string) =>
    api.post('/auth/solicitar-reset', { email }),
  resetarSenha: (token: string, novaSenha: string) =>
    api.post('/auth/reset-senha', { token, novaSenha }),
  perfil: () => api.get('/auth/perfil'),
};

// FILMES
export const filmesAPI = {
  listar: (params?: Record<string, string | number | boolean>) =>
    api.get('/filmes', { params }),
  buscar: (id: string) => api.get(`/filmes/${id}`),
  verificarAcesso: (id: string) => api.get(`/filmes/${id}/acesso`),
  categorias: () => api.get('/filmes/categorias'),
};

// PAGAMENTOS
export const pagamentosAPI = {
  iniciar: (filmeId: string) =>
    api.post('/pagamentos/iniciar', { filmeId }),
  verificar: (txid: string) =>
    api.get(`/pagamentos/verificar/${txid}`),
  minhasCompras: () => api.get('/pagamentos/minhas-compras'),
};

// ADMIN
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  filmes: {
    listar: () => api.get('/admin/filmes'),
    criar: (data: Record<string, unknown>) => api.post('/admin/filmes', data),
    atualizar: (id: string, data: Record<string, unknown>) => api.put(`/admin/filmes/${id}`, data),
    excluir: (id: string) => api.delete(`/admin/filmes/${id}`),
  },
  usuarios: () => api.get('/admin/usuarios'),
  pagamentos: () => api.get('/admin/pagamentos'),
  aprovarPagamento: (compraId: string) => api.post(`/admin/pagamentos/${compraId}/aprovar`),
};

export default api;
