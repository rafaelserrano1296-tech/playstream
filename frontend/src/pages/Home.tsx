import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Search, X, Flame, Gift, Star, Tv } from 'lucide-react';
import { Filme } from '../types';
import { filmesAPI } from '../services/api';
import FilmeCard from '../components/ui/FilmeCard';
import Loading from '../components/ui/Loading';

const PLACEHOLDER = 'https://via.placeholder.com/1280x720/1a1a1a/555?text=Play+Stream';

function Slider({ titulo, icone, filmes, forcePremium }: { titulo: string; icone: React.ReactNode; filmes: Filme[]; forcePremium?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'right' ? 600 : -600, behavior: 'smooth' });
  };
  if (!filmes.length) return null;
  return (
    <section className="mb-10">
      <h2 className="text-lg md:text-xl font-bold text-white mb-3 px-4 md:px-0 flex items-center gap-2">
        {icone} {titulo}
      </h2>
      <div className="relative group">
        <button onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-r-lg opacity-0 group-hover:opacity-100 transition-all -translate-x-full group-hover:translate-x-0 shadow-xl">
          <ChevronLeft size={22} />
        </button>
        <div ref={ref} className="flex gap-3 overflow-x-auto px-4 md:px-0 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {filmes.map((filme) => (
            <div key={filme.id} className="flex-shrink-0 w-36 sm:w-40 md:w-44">
              <FilmeCard filme={filme} forcePremium={forcePremium} />
            </div>
          ))}
        </div>
        <button onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-l-lg opacity-0 group-hover:opacity-100 transition-all translate-x-full group-hover:translate-x-0 shadow-xl">
          <ChevronRight size={22} />
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  const [todos, setTodos] = useState<Filme[]>([]);
  const [destaques, setDestaques] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const [destRes, todosRes] = await Promise.all([
          filmesAPI.listar({ destaque: true, limit: 5 }),
          filmesAPI.listar({ limit: 100 }),
        ]);
        setDestaques(destRes.data.filmes || []);
        setTodos(todosRes.data.filmes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  useEffect(() => {
    if (destaques.length <= 1) return;
    const interval = setInterval(() => setBannerIdx((i) => (i + 1) % destaques.length), 6000);
    return () => clearInterval(interval);
  }, [destaques.length]);

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (busca.trim()) navigate(`/busca?q=${encodeURIComponent(busca.trim())}`);
  };

  const emAlta = todos.filter((f) => f.destaque);
  const gratis = todos.filter((f) => f.gratuito);
  const premium = todos.filter((f) => !f.gratuito);
  const lancamentos = todos.filter((f) => f.lancamento);

  const bannerAtual = destaques[bannerIdx];

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-[#0d0d14]">

      {/* Banner Hero */}
      {bannerAtual && (
        <div className="relative h-[75vh] min-h-[400px] overflow-hidden">
          <img src={bannerAtual.capa_url || PLACEHOLDER} alt={bannerAtual.titulo}
            className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 pb-20 px-6 md:px-16 max-w-2xl">
            {!bannerAtual.gratuito && (
              <span className="inline-block bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">PREMIUM</span>
            )}
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
              {bannerAtual.titulo}
            </h1>
            {bannerAtual.descricao && (
              <p className="text-gray-200 text-sm md:text-base mb-6 line-clamp-2">{bannerAtual.descricao}</p>
            )}
            <div className="flex gap-3">
              <Link to={`/filme/${bannerAtual.id}`} className="bg-white hover:bg-gray-200 text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all active:scale-95">
                <Play size={18} fill="black" /> Assistir
              </Link>
              <Link to={`/filme/${bannerAtual.id}`} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all">
                <Info size={18} /> Mais Info
              </Link>
            </div>
          </div>

          {destaques.length > 1 && (
            <div className="absolute bottom-6 right-6 flex gap-1.5">
              {destaques.map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === bannerIdx ? 'bg-pink-500 w-6' : 'bg-white/40 w-1.5'}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 -mt-8 relative z-10">

        {/* Barra de busca */}
        <form onSubmit={handleBusca} className="relative mb-10">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar doramas, filmes, séries..."
            className="w-full bg-zinc-800/80 backdrop-blur border border-zinc-700 text-white rounded-xl pl-11 pr-10 py-3 focus:outline-none focus:border-pink-500 transition-colors placeholder-zinc-500"
          />
          {busca && (
            <button type="button" onClick={() => setBusca('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          )}
        </form>

        {/* Seções */}
        <Slider titulo="Em Alta" icone={<Flame size={20} className="text-orange-400" />} filmes={emAlta} />
        <Slider titulo="Doramas Grátis" icone={<Gift size={20} className="text-green-400" />} filmes={gratis} />
        <Slider titulo="Exclusivos Premium" icone={<Star size={20} className="text-yellow-400" />} filmes={premium} forcePremium />
        <Slider titulo="Lançamentos" icone={<Tv size={20} className="text-pink-400" />} filmes={lancamentos} />

        {!todos.length && (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg mb-2">Nenhum dorama disponível ainda.</p>
            <p className="text-gray-600 text-sm">Em breve novos doramas chegando!</p>
          </div>
        )}
      </div>
    </div>
  );
}
