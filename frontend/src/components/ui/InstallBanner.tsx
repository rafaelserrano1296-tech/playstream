import React from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function InstallBanner() {
  const { podeInstalar, instalado, instalar } = usePWAInstall();
  const [fechado, setFechado] = React.useState(false);

  if (!podeInstalar || instalado || fechado) return null;

  return (
    <div className="w-full bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900 border border-pink-500/30 rounded-xl p-4 mb-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Instale o app no seu celular!</p>
          <p className="text-pink-300 text-xs mt-0.5">Acesse com um toque, sem abrir o navegador</p>
        </div>
        <button
          onClick={() => setFechado(true)}
          className="text-gray-400 hover:text-white p-1 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
      <button
        onClick={instalar}
        className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
      >
        <Download size={18} /> Baixar App Grátis
      </button>
    </div>
  );
}
