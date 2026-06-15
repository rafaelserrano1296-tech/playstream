import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check, Star, Tv, Zap, Copy, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { assinaturasAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Assinatura() {
  const { autenticado, assinaturaAtiva: assinaturaAtivaCtx, diasRestantes } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<{ txid: string; pix_copia_cola: string; qr_code_base64?: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [assinaturaAtiva, setAssinaturaAtiva] = useState(false);
  const [dataFim, setDataFim] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    if (!autenticado) { navigate('/login'); return; }
    if (assinaturaAtivaCtx) {
      setAssinaturaAtiva(true);
    }
    assinaturasAPI.status().then((res) => {
      if (res.data.ativa) {
        setAssinaturaAtiva(true);
        setDataFim(res.data.data_fim);
      }
    }).catch(() => {});
  }, [autenticado, assinaturaAtivaCtx]);

  const iniciarAssinatura = async () => {
    setLoading(true);
    try {
      const res = await assinaturasAPI.iniciar();
      if (res.data.assinatura_ativa) {
        setAssinaturaAtiva(true);
        setDataFim(res.data.data_fim);
        return;
      }
      setPix(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao gerar PIX');
    } finally {
      setLoading(false);
    }
  };

  const copiar = async () => {
    if (!pix?.pix_copia_cola) return;
    await navigator.clipboard.writeText(pix.pix_copia_cola);
    setCopiado(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopiado(false), 3000);
  };

  const verificarPagamento = async () => {
    setVerificando(true);
    try {
      const res = await assinaturasAPI.status();
      if (res.data.ativa) {
        setAssinaturaAtiva(true);
        setDataFim(res.data.data_fim);
        setPix(null);
        toast.success('Pagamento confirmado! Acesso liberado.');
      } else {
        toast.error('Pagamento ainda não confirmado. Aguarde alguns segundos.');
      }
    } catch {
      toast.error('Erro ao verificar pagamento');
    } finally {
      setVerificando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] pt-20 pb-16 px-4">
      <div className="max-w-lg mx-auto">

        {assinaturaAtiva ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-yellow-500/20 border-2 border-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown size={40} className="text-yellow-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Assinatura Ativa!</h1>
            <p className="text-gray-400 mb-2">Você tem acesso a todo o catálogo premium.</p>
            {dataFim && (
              <p className="text-sm text-gray-500 mb-2">
                Válida até: <span className="text-white font-semibold">{new Date(dataFim).toLocaleDateString('pt-BR')}</span>
              </p>
            )}
            {diasRestantes !== null && (
              <p className="text-sm text-yellow-400 font-semibold mb-8">{diasRestantes} dias restantes</p>
            )}
            <button onClick={() => navigate('/')} className="btn-primary py-3 px-8 text-base">
              Ir para o Catálogo
            </button>
          </div>

        ) : !pix ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-pink-600/20 border-2 border-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={30} className="text-pink-400" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2">Assinar Play Stream</h1>
              <p className="text-gray-400">Acesso completo a todos os doramas e filmes premium</p>
            </div>

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
                    Gerando PIX...
                  </span>
                ) : 'Assinar por R$9,90/mês'}
              </button>
            </div>

            <p className="text-center text-xs text-gray-600">
              Pagamento via PIX • Acesso liberado automaticamente após confirmação
            </p>
          </>

        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-white mb-1">Pague com PIX</h1>
              <p className="text-gray-400 text-sm">Escaneie o QR Code ou copie o código</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
              <div className="text-center mb-4">
                <p className="text-3xl font-black text-white">R$ 9,90</p>
                <p className="text-gray-500 text-sm">Assinatura mensal — 30 dias de acesso</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-xl">
                  {pix.qr_code_base64 ? (
                    <img
                      src={`data:image/png;base64,${pix.qr_code_base64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-sm">
                      Use o código abaixo
                    </div>
                  )}
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mb-4">
                Abra o app do banco → PIX → Escanear QR Code
              </p>

              {/* Copia e cola */}
              <div className="bg-zinc-800 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-400 mb-2">PIX Copia e Cola:</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-300 break-all flex-1 line-clamp-2">{pix.pix_copia_cola}</p>
                  <button
                    onClick={copiar}
                    className={`flex-shrink-0 p-2 rounded transition-colors ${copiado ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                  >
                    {copiado ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <button
                onClick={verificarPagamento}
                disabled={verificando}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-xl transition-colors disabled:opacity-50 mb-3"
              >
                {verificando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : 'Já Paguei — Verificar Acesso'}
              </button>

              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-3 text-center">
                <p className="text-green-400 text-sm font-semibold">✓ Acesso liberado automaticamente após o pagamento</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
