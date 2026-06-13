import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Play } from 'lucide-react';
import { Filme } from '../../types';

interface Props {
  filme: Filme;
}

const PLACEHOLDER = 'https://via.placeholder.com/300x450/1a1a1a/555?text=Sem+Capa';

export default function FilmeCard({ filme }: Props) {
  return (
    <Link to={`/filme/${filme.id}`} className="group relative block rounded-md overflow-hidden bg-zinc-900 card-hover cursor-pointer">
      {/* Capa */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={filme.capa_url || PLACEHOLDER}
          alt={filme.titulo}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge */}
        <div className="absolute top-2 left-2">
          {filme.gratuito ? (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">GRÁTIS</span>
          ) : (
            <span className="bg-netflix-red text-white text-[10px] font-bold px-2 py-0.5 rounded">PREMIUM</span>
          )}
        </div>

        {/* Cadeado */}
        {!filme.gratuito && (
          <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
            <Lock size={12} className="text-yellow-400" />
          </div>
        )}

        {/* Botão play no hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
            <Play size={20} className="text-white ml-1" fill="white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <h3 className="text-sm font-semibold truncate text-white group-hover:text-netflix-red transition-colors">
          {filme.titulo}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400 capitalize">{filme.tipo}</span>
          {filme.ano && <span className="text-xs text-gray-500">{filme.ano}</span>}
        </div>
        {!filme.gratuito && (
          <p className="text-xs text-yellow-400 font-semibold mt-1">
            R$ {Number(filme.valor).toFixed(2)}
          </p>
        )}
      </div>
    </Link>
  );
}
