import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Filme } from '../types';
import { filmesAPI } from '../services/api';
import InstallBanner from '../components/ui/InstallBanner';
import FilmesSlider from '../components/ui/FilmesSlider';
import FilmeCard from '../components/ui/FilmeCard';
import Loading from '../components/ui/Loading';

const PLACEHOLDER = 'https://via.placeholder.com/1280x720/1a1a1a/555?text=Play+Stream';

export default function Home() {
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get('tipo') || '';
  const lancamento = searchParams.get('lancamento') || '';

  const [destaques, setDestaques] = useState<Filme[]>([]);
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [series, setSeries] = useState<Filme[]>([]);
  const [lancamentos, setLancamentos] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (tipo) params.tipo = tipo;
        if (lancamento) params.lancamento = lancamento;

        const [destRes, filmesRes, seriesRes, lancRes] = await Promise.all([
          filmesAPI.listar({ destaque: true, limit: 5 }),
          filmesAPI.listar({ tipo: 'filme', limit: 30 }),
          filmesAPI.listar({ tipo: 'serie', limit: 30 }),
          filmesAPI.listar({ lancamento: true, limit: 30 }),
        ]);

        setDestaques(destRes.data.filmes);
        setFilmes(filmesRes.data.filmes);
        setSeries(seriesRes.data.filmes);
        setLancamentos(lancRes.data.filmes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [tipo, lancamento]);

  // Auto-rotação do banner
  useEffect(() => {
    if (destaques.length <= 1) return;
    const interval = setInterval(() => {
      setBannerIdx((i) => (i + 1) % destaques.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [destaques.length]);

  const bannerAtual = destaques[bannerIdx];

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-netflix-dark">
      {/* Banner Hero */}
      {bannerAtual && (
        <div className="relative h-[85vh] min-h-[500px] overflow-hidden">
          <img
            src={bannerAtual.capa_url || PLACEHOLDER}
            alt={bannerAtual.titulo}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradientes */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-transparent to-transparent" />

          {/* Conteúdo do banner */}
          <div className="absolute bottom-0 left-0 right-0 pb-24 px-6 md:px-16 max-w-2xl">
            <div className="animate-fade-in">
              {!bannerAtual.gratuito && (
                <span className="inline-block bg-netflix-red text-white text-xs font-bold px-3 py-1 rounded mb-3">PREMIUM</span>
              )}
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
                {bannerAtual.titulo}
              </h1>
              {bannerAtual.descricao && (
                <p className="text-gray-200 text-base md:text-lg mb-6 line-clamp-3 drop-shadow">
                  {bannerAtual.descricao}
                </p>
              )}
              <div className="flex gap-3">
                <Link to={`/filme/${bannerAtual.id}`} className="btn-primary flex items-center gap-2 text-base">
                  <Play size={20} fill="white" /> Assistir
                </Link>
                <Link to={`/filme/${bannerAtual.id}`} className="btn-secondary flex items-center gap-2 text-base">
                  <Info size={20} /> Mais Info
                </Link>
              </div>
            </div>
          </div>

          {/* Navegação do banner */}
          {destaques.length > 1 && (
            <>
              <button
                onClick={() => setBannerIdx((i) => (i - 1 + destaques.length) % destaques.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setBannerIdx((i) => (i + 1) % destaques.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-all"
              >
                <ChevronRight size={24} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-8 right-6 flex gap-1.5">
                {destaques.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setBannerIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? 'bg-netflix-red w-4' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 -mt-12 relative z-10">
        <InstallBanner />
        {series.length > 0 && <FilmesSlider titulo="Doramas em Destaque" filmes={series} />}
        {filmes.length > 0 && <FilmesSlider titulo="Filmes Asiáticos" filmes={filmes} />}
        {lancamentos.length > 0 && <FilmesSlider titulo="Lançamentos" filmes={lancamentos} />}

        {!destaques.length && !filmes.length && !series.length && !lancamentos.length && (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg mb-2">Nenhum dorama disponível ainda.</p>
            <p className="text-gray-600 text-sm">Em breve novos doramas chegando!</p>
          </div>
        )}
      </div>
    </div>
  );
}
