import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Play } from 'lucide-react';
import { Compra } from '../types';
import { pagamentosAPI } from '../services/api';
import Loading from '../components/ui/Loading';

const PLACEHOLDER = 'https://via.placeholder.com/120x180/1a1a1a/555?text=Sem+Capa';

export default function MinhasCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pagamentosAPI.minhasCompras()
      .then((res) => setCompras(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-netflix-dark pt-24 px-4 md:px-8 max-w-5xl mx-auto pb-16">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag size={24} className="text-netflix-red" />
        <h1 className="text-2xl font-bold">Minhas Compras</h1>
      </div>

      {loading ? <Loading /> : (
        <>
          {compras.length > 0 ? (
            <div className="space-y-4">
              {compras.map((compra) => (
                <div key={compra.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-600 transition-colors">
                  <img
                    src={compra.capa_url || PLACEHOLDER}
                    alt={compra.titulo}
                    className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{compra.titulo}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Pago: R$ {Number(compra.valor_pago).toFixed(2)}
                    </p>
                    {compra.data_pagamento && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(compra.data_pagamento).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}
                      </p>
                    )}
                    <span className="inline-block mt-2 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded">
                      Acesso Liberado
                    </span>
                  </div>
                  <Link to={`/filme/${compra.filme_id}`}
                    className="flex items-center gap-2 bg-netflix-red hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex-shrink-0">
                    <Play size={14} fill="white" /> Assistir
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">Nenhuma compra ainda</p>
              <p className="text-gray-600 text-sm mb-6">Explore nosso catálogo e adquira conteúdo premium</p>
              <Link to="/" className="btn-primary">Ver Catálogo</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
