import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../types';
import { authAPI } from '../services/api';

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  autenticado: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('sf_token');
    const storedUser = localStorage.getItem('sf_usuario');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

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
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
