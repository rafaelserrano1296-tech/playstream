import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronDown, Menu, X, User, LogOut, Settings, Download, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function Navbar() {
  const { autenticado, usuario, logout, isAdmin, assinaturaAtiva, diasRestantes } = useAuth();
  const { podeInstalar, instalado, instalar } = usePWAInstall();
  const [scrolled, setScrolled] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [userMenuAberto, setUserMenuAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMenuAberto(false);
    setUserMenuAberto(false);
  }, [location]);

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      navigate(`/busca?q=${encodeURIComponent(termoBusca.trim())}`);
      setBuscaAberta(false);
      setTermoBusca('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (['/login', '/cadastro', '/recuperar-senha', '/reset-senha'].includes(location.pathname)) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-netflix-dark shadow-2xl' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="font-black text-2xl tracking-tight bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
              PLAY STREAM
            </Link>
            {/* Nav desktop */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/" className="text-white hover:text-gray-300 transition-colors">Início</Link>
              <Link to="/?tipo=filme" className="text-gray-300 hover:text-white transition-colors">Filmes Doramas</Link>
              <Link to="/?tipo=serie" className="text-gray-300 hover:text-white transition-colors">Séries Doramas</Link>
            </div>
          </div>

          {/* Direita */}
          <div className="flex items-center gap-3">
            {/* Busca */}
            {buscaAberta ? (
              <form onSubmit={handleBusca} className="flex items-center">
                <input
                  autoFocus
                  type="text"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  placeholder="Títulos, séries, filmes..."
                  className="bg-black/80 border border-white/50 text-white text-sm px-3 py-1.5 rounded-l focus:outline-none w-48 md:w-64"
                />
                <button type="submit" className="bg-white/10 border border-white/50 border-l-0 px-3 py-1.5 rounded-r hover:bg-white/20 transition-colors">
                  <Search size={16} />
                </button>
                <button type="button" onClick={() => setBuscaAberta(false)} className="ml-2 text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button onClick={() => setBuscaAberta(true)} className="text-gray-300 hover:text-white transition-colors p-1">
                <Search size={20} />
              </button>
            )}

            {/* Botão instalar PWA */}
            {podeInstalar && !instalado && (
              <button
                onClick={instalar}
                className="hidden sm:flex items-center gap-2 bg-netflix-red hover:bg-red-700 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-all active:scale-95"
              >
                <Download size={15} /> Instalar App
              </button>
            )}
            {instalado && (
              <span className="hidden sm:flex items-center gap-1.5 text-green-400 text-xs font-medium">
                <Download size={13} /> App Instalado
              </span>
            )}

            {autenticado ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuAberto(!userMenuAberto)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="relative">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${assinaturaAtiva ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black' : 'bg-netflix-red text-white'}`}>
                      {usuario?.nome[0].toUpperCase()}
                    </div>
                    {assinaturaAtiva && (
                      <Crown size={10} className="absolute -top-1.5 -right-1.5 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  <ChevronDown size={14} className={`hidden md:block transition-transform ${userMenuAberto ? 'rotate-180' : ''}`} />
                </button>

                {userMenuAberto && (
                  <div className="absolute right-0 top-12 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-52 py-1 animate-fade-in">
                    <div className="px-4 py-2 border-b border-zinc-700">
                      <p className="text-sm font-semibold truncate">{usuario?.nome}</p>
                      <p className="text-xs text-gray-400 truncate">{usuario?.email}</p>
                      {assinaturaAtiva && diasRestantes !== null && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Crown size={11} className="text-yellow-400 fill-yellow-400" />
                          <p className="text-xs text-yellow-400 font-semibold">Premium · {diasRestantes}d restantes</p>
                        </div>
                      )}
                    </div>
                    <Link to="/perfil" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors">
                      <User size={15} /> Meu Perfil
                    </Link>
                    <Link to="/assinar" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors text-yellow-400">
                      <Crown size={15} /> {assinaturaAtiva ? 'Minha Assinatura' : 'Assinar Premium'}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors text-netflix-red">
                        <Settings size={15} /> Painel Admin
                      </Link>
                    )}
                    <hr className="border-zinc-700 my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors w-full text-left text-gray-400">
                      <LogOut size={15} /> Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-1.5 px-4">
                Entrar
              </Link>
            )}

            {/* Menu mobile */}
            <button onClick={() => setMenuAberto(!menuAberto)} className="md:hidden text-gray-300 hover:text-white p-1">
              {menuAberto ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <div className="md:hidden bg-netflix-dark border-t border-zinc-800 px-4 py-4 space-y-3 animate-slide-up">
          <Link to="/" className="block text-white hover:text-gray-300 py-2">Início</Link>
          <Link to="/?tipo=filme" className="block text-gray-300 hover:text-white py-2">Filmes Doramas</Link>
          <Link to="/?tipo=serie" className="block text-gray-300 hover:text-white py-2">Séries Doramas</Link>
          {podeInstalar && !instalado && (
            <button
              onClick={instalar}
              className="flex items-center gap-2 bg-netflix-red text-white text-sm font-bold px-4 py-2 rounded-lg w-full justify-center mt-2"
            >
              <Download size={15} /> Instalar App no Celular
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
