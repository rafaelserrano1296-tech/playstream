import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import Loading from '../../components/ui/Loading';

interface Compra {
  id: string; usuario_nome: string; usuario_email: string; filme_titulo: string;
  valor_pago: number; status_pagamento: string; data_pagamento?: string; criado_em: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  aprovado: { label: 'Aprovado', color: 'text-green-400 bg-green-400/10' },
  pendente: { label: 'Pendente', color: 'text-yellow-400 bg-yellow-400/10' },
  cancelado: { label: 'Cancelado', color: 'text-red-400 bg-red-400/10' },
  expirado: { label: 'Expirado', color: 'text-gray-400 bg-gray-400/10' },
};

export default function AdminPagamentos() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    adminAPI.pagamentos()
      .then((res) => setCompras(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const aprovar = async (id: string) => {
    await adminAPI.aprovarPagamento(id);
    toast.success('Pagamento aprovado manualmente!');
    carregar();
  };

  if (loading) return <Loading />;

  const total = compras.filter((c) => c.status_pagamento === 'aprovado').reduce((s, c) => s + Number(c.valor_pago), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Pagamentos</h1>
        <div className="text-right">
          <p className="text-xs text-gray-400">Receita total</p>
          <p className="text-xl font-black text-white">R$ {total.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-gray-400 text-left">
                <th className="px-4 py-3">Usuário</th>
                <th className="px-4 py-3 hidden md:table-cell">Filme</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Data</th>
                <th className="px-4 py-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c) => {
                const st = statusConfig[c.status_pagamento] || statusConfig.pendente;
                return (
                  <tr key={c.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white truncate max-w-[120px]">{c.usuario_nome}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px]">{c.usuario_email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-300 truncate max-w-[150px]">{c.filme_titulo}</td>
                    <td className="px-4 py-3 font-semibold text-white">R$ {Number(c.valor_pago).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                      {c.data_pagamento ? new Date(c.data_pagamento).toLocaleDateString('pt-BR') : new Date(c.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      {c.status_pagamento === 'pendente' && (
                        <button onClick={() => aprovar(c.id)}
                          className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded transition-colors">
                          <Check size={12} /> Aprovar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {compras.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Nenhum pagamento registrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
