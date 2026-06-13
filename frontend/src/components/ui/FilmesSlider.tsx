import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Filme } from '../../types';
import FilmeCard from './FilmeCard';

interface Props {
  titulo: string;
  filmes: Filme[];
}

export default function FilmesSlider({ titulo, filmes }: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: dir === 'right' ? 600 : -600, behavior: 'smooth' });
    }
  };

  if (!filmes.length) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white mb-3 px-4 md:px-0">{titulo}</h2>
      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white p-2 rounded-r-md opacity-0 group-hover:opacity-100 transition-all -translate-x-full group-hover:translate-x-0 shadow-xl"
        >
          <ChevronLeft size={24} />
        </button>

        <div
          ref={sliderRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filmes.map((filme) => (
            <div key={filme.id} className="flex-shrink-0 w-36 sm:w-40 md:w-44">
              <FilmeCard filme={filme} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white p-2 rounded-l-md opacity-0 group-hover:opacity-100 transition-all translate-x-full group-hover:translate-x-0 shadow-xl"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}
