import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Filme } from '../types';
import { filmesAPI } from '../services/api';
import FilmeCard from '../components/ui/FilmeCard';
import Loading from '../components/ui/Loading';

export default function Busca() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    filmesAPI.listar({ busca: q, limit: 50 })
      .then((res) => setFilmes(res.data.filmes))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="min-h-screen bg-netflix-dark pt-24 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Search size={24} className="text-netflix-red" />
        <h1 className="text-2xl font-bold">
          {q ? `Resultados para "${q}"` : 'Busca'}
        </h1>
      </div>

      {loading ? <Loading /> : (
        <>
          {filmes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filmes.map((f) => <FilmeCard key={f.id} filme={f} />)}
            </div>
          ) : q ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">Nenhum resultado para "{q}"</p>
              <p className="text-gray-600 text-sm mt-2">Tente outros termos de busca</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
