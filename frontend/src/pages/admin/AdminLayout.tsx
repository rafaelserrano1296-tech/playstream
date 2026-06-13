import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Film, Users, CreditCard, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/filmes', label: 'Filmes', icon: Film },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/pagamentos', label: 'Pagamentos', icon: CreditCard },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = () => (
    <aside className="w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full">
      <div className="p-6 border-b border-zinc-800">
        <p className="font-black text-xl bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">PLAY STREAM</p>
        <p className="text-xs text-gray-500 mt-1">Painel Administrativo</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-netflix-red text-white' : 'text-gray-400 hover:bg-zinc-800 hover:text-white'}`
            }
            onClick={() => setSidebarAberta(false)}
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-zinc-800">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg w-full text-sm transition-colors">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-zinc-900 flex">
      {/* Sidebar desktop */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Sidebar mobile */}
      {sidebarAberta && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60"><Sidebar /></div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarAberta(false)} />
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex-1 md:ml-60 flex flex-col">
        {/* Header mobile */}
        <div className="md:hidden flex items-center justify-between bg-zinc-950 border-b border-zinc-800 px-4 py-3">
          <p className="font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">PLAY STREAM</p>
          <button onClick={() => setSidebarAberta(true)} className="text-gray-400 hover:text-white">
            <Menu size={22} />
          </button>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
