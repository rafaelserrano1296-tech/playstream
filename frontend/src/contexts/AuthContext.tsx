import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../types';
import { authAPI, assinaturasAPI } from '../services/api';

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  autenticado: boolean;
  assinaturaAtiva: boolean;
  diasRestantes: number | null;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [assinaturaAtiva, setAssinaturaAtiva] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('sf_token');
    const storedUser = localStorage.getItem('sf_usuario');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) { setAssinaturaAtiva(false); setDiasRestantes(null); return; }
    assinaturasAPI.status().then((res) => {
      if (res.data.ativa) {
        setAssinaturaAtiva(true);
        const dias = Math.ceil((new Date(res.data.data_fim).getTime() - Date.now()) / 86400000);
        setDiasRestantes(dias);
      } else {
        setAssinaturaAtiva(false);
        setDiasRestantes(null);
      }
    }).catch(() => {});
  }, [token]);

  const salvar = (tok: string, user: Usuario) => {
    setToken(tok);
    setUsuario(user);
    localStorage.setItem('sf_token', tok);
    localStorage.setItem('sf_usuario', JSON.stringify(user));
  };

  const login = async (email: string, senha: string) => {
    const { data } = await authAPI.login(email, senha);
    salvar(data.token, data.usuario);
  };

  const cadastrar = async (nome: string, email: string, senha: string) => {
    const { data } = await authAPI.cadastrar(nome, email, senha);
    salvar(data.token, data.usuario);
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_usuario');
  };

  return (
    <AuthContext.Provider value={{
      usuario, token, loading,
      login, cadastrar, logout,
      isAdmin: usuario?.role === 'admin',
      autenticado: !!token,
      assinaturaAtiva,
      diasRestantes,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
