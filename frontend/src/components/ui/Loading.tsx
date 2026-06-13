import React from 'react';

export default function Loading({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen bg-netflix-dark' : 'py-16'}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    </div>
  );
}
