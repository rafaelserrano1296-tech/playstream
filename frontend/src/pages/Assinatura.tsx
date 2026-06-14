import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Check, Star, Tv, Zap, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { assinaturasAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Assinatura() {
  const { autenticado } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [assinaturaAtiva, setAssinaturaAtiva] = useState(false);
  const [dataFim, setDataFim] = useState<string | null>(null);
  const pagou = searchParams.get('pago') === '1';

  useEffect(() => {
    if (!autenticado) { navigate('/login'); return; }
    assinaturasAPI.status().then((res) => {
      if (res.data.ativa) {
        setAssinaturaAtiva(true);
        setDataFim(res.data.data_fim);
      }
    }).catch(() => {});
  }, [autenticado]);

  const iniciarAssinatura = async () => {
    setLoading(true);
    try {
      const res = await assinaturasAPI.iniciar();
      if (res.data.assinatura_ativa) {
        setAssinaturaAtiva(true);
        setDataFim(res.data.data_fim);
        return;
      }
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Link de pagamento não disponível');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao gerar link de pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] pt-20 pb-16 px-4">
      <div className="max-w-lg mx-auto">

        {assinaturaAtiva ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Assinatura Ativa!</h1>
            <p className="text-gray-400 mb-2">Você tem acesso a todo o catálogo premium.</p>
            {dataFim && (
              <p className="text-sm text-gray-500 mb-8">
                Válida até: <span className="text-white font-semibold">{new Date(dataFim).toLocaleDateString('pt-BR')}</span>
              </p>
            )}
            <button onClick={() => navigate('/')} className="btn-primary py-3 px-8 text-base">
              Ir para o Catálogo
            </button>
          </div>
        ) : pagou ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-yellow-500/20 border-2 border-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={40} className="text-yellow-400" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Pagamento recebido!</h1>
            <p className="text-gray-400 mb-6">Seu acesso será liberado em instantes após a confirmação do PIX.</p>
            <button onClick={() => window.location.reload()} className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black py-3 rounded-xl mb-3">
              Verificar acesso
            </button>
            <button onClick={() => navigate('/')} className="w-full text-gray-400 py-3 text-sm">
              Ir para o catálogo
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-pink-600/20 border-2 border-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={30} className="text-pink-400" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2">Assinar Play Stream</h1>
              <p className="text-gray-400">Acesso completo a todos os doramas e filmes premium</p>
            </div>

            {/* Card de preço */}
            <div className="bg-zinc-900 border border-pink-500/30 rounded-2xl p-6 mb-6">
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm mb-1">Assinatura mensal</p>
                <p className="text-5xl font-black text-white">R$9,90</p>
                <p className="text-gray-500 text-sm mt-1">por mês • Cancele quando quiser</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { icon: Tv, text: 'Acesso a todos os doramas premium' },
                  { icon: Zap, text: 'Novos conteúdos toda semana' },
                  { icon: Lock, text: 'Assista no app ou no navegador' },
                  { icon: Check, text: 'Pagamento seguro via PIX' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-gray-300">
                    <Icon size={16} className="text-pink-400 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>

              <button
                onClick={iniciarAssinatura}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black py-4 rounded-xl text-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Aguarde...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ExternalLink size={18} />
                    Assinar por R$9,90/mês
                  </span>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-gray-600">
              Pagamento via PIX • Acesso liberado automaticamente após confirmação
            </p>
          </>
        )}
      </div>
    </div>
  );
}
