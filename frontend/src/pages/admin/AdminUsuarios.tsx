import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { adminAPI } from '../../services/api';
import Loading from '../../components/ui/Loading';

interface Usuario {
  id: string; nome: string; email: string; role: string; ativo: boolean; data_cadastro: string;
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.usuarios()
      .then((res) => setUsuarios(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <span className="bg-zinc-700 text-gray-300 text-xs px-2 py-1 rounded-full">{usuarios.length}</span>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-gray-400 text-left">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3 hidden md:table-cell">E-mail</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-netflix-red rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {u.nome[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-white truncate max-w-[120px]">{u.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-400 truncate max-w-[200px]">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.role === 'admin'
                      ? <span className="bg-netflix-red/20 text-netflix-red text-xs px-2 py-1 rounded">Admin</span>
                      : <span className="bg-zinc-600/50 text-gray-300 text-xs px-2 py-1 rounded">Usuário</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {u.ativo
                      ? <span className="text-green-400 text-xs">Ativo</span>
                      : <span className="text-red-400 text-xs">Inativo</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                    {new Date(u.data_cadastro).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Nenhum usuário encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
