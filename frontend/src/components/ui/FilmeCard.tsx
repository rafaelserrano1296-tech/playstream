import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Play, Crown } from 'lucide-react';
import { Filme } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  filme: Filme;
  forcePremium?: boolean;
}

const PLACEHOLDER = 'https://via.placeholder.com/300x450/1a1a1a/555?text=Sem+Capa';

export default function FilmeCard({ filme, forcePremium }: Props) {
  const { assinaturaAtiva } = useAuth();
  const isPremium = forcePremium || !filme.gratuito;
  const bloqueado = isPremium && !assinaturaAtiva;

  return (
    <Link to={`/filme/${filme.id}`} className="group relative block rounded-xl overflow-hidden bg-zinc-900 card-hover cursor-pointer shadow-lg">
      {/* Capa */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={filme.capa_url || PLACEHOLDER}
          alt={filme.titulo}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${bloqueado ? 'brightness-50' : ''}`}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Cadeado — só aparece se bloqueado */}
        {bloqueado && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-yellow-400/50">
              <Lock size={26} className="text-yellow-400" />
            </div>
            <span className="text-yellow-400 text-xs font-bold bg-black/60 px-2 py-0.5 rounded-full">PREMIUM</span>
          </div>
        )}

        {/* Badge grátis */}
        {!isPremium && (
          <div className="absolute top-2 left-2">
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">GRÁTIS</span>
          </div>
        )}

        {/* Badge premium desbloqueado para assinante */}
        {isPremium && assinaturaAtiva && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Crown size={9} /> PREMIUM
            </span>
          </div>
        )}

        {/* Botão play no hover */}
        {!bloqueado && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
              <Play size={20} className="text-white ml-1" fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <h3 className="text-sm font-semibold truncate text-white group-hover:text-pink-400 transition-colors">
          {filme.titulo}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400 capitalize">{filme.tipo === 'serie' ? 'Dorama' : 'Filme'}</span>
          {filme.ano && <span className="text-xs text-gray-500">{filme.ano}</span>}
        </div>
        {bloqueado && (
          <p className="text-xs text-yellow-400 font-semibold mt-1">🔒 Apenas assinantes</p>
        )}
      </div>
    </Link>
  );
}
