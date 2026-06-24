import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import RecuperarSenha from './pages/RecuperarSenha';
import ResetSenha from './pages/ResetSenha';
import DetalheFilme from './pages/DetalheFilme';
import MinhasCompras from './pages/MinhasCompras';
import Perfil from './pages/Perfil';
import Busca from './pages/Busca';
import Assinatura from './pages/Assinatura';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFilmes from './pages/admin/AdminFilmes';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminPagamentos from './pages/admin/AdminPagamentos';

const RotaPrivada = ({ children }: { children: React.ReactNode }) => {
  const { autenticado, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-netflix-dark flex items-center justify-center"><div className="w-8 h-8 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" /></div>;
  return autenticado ? <>{children}</> : <Navigate to="/login" replace />;
};

const RotaAdmin = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/reset-senha" element={<ResetSenha />} />
        <Route path="/" element={<Home />} />
        <Route path="/busca" element={<Busca />} />
        <Route path="/filme/:id" element={<DetalheFilme />} />
        <Route path="/minhas-compras" element={<RotaPrivada><MinhasCompras /></RotaPrivada>} />
        <Route path="/perfil" element={<RotaPrivada><Perfil /></RotaPrivada>} />
        <Route path="/assinar" element={<Assinatura />} />
        <Route path="/admin" element={<RotaAdmin><AdminLayout /></RotaAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="filmes" element={<AdminFilmes />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="pagamentos" element={<AdminPagamentos />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
