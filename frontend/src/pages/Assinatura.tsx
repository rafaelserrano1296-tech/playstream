import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check, Tv, Zap, Copy, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { assinaturasAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PLANOS = [
  {
    id: 'semanal',
    nome: 'Semanal',
    preco: 'R$7,99',
    periodo: '7 dias',
    destaque: false,
    badge: null,
  },
  {
    id: 'mensal',
    nome: 'Mensal',
    preco: 'R$14,99',
    periodo: '30 dias',
    destaque: true,
    badge: 'MAIS POPULAR',
  },
];

export default function Assinatura() {
  const { autenticado, assinaturaAtiva: assinaturaAtivaCtx, diasRestantes } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState('mensal');
  const [pix, setPix] = useState<{ txid: string; pix_copia_cola: string; qr_code_base64?: string; valor: number; plano: string; dias: number } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [assinaturaAtiva, setAssinaturaAtiva] = useState(false);
  const [dataFim, setDataFim] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    if (assinaturaAtivaCtx) setAssinaturaAtiva(true);
    assinaturasAPI.status().then((res) => {
      if (res.data.ativa) {
        setAssinaturaAtiva(true);
        setDataFim(res.data.data_fim);
      }
    }).catch(() => {});
  }, [autenticado, assinaturaAtivaCtx]);

  const iniciarAssinatura = async () => {
    if (!autenticado) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await assinaturasAPI.iniciar(planoSelecionado);
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
                <Crown size={30} className="text-pink-400" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2">Assinar Play Stream</h1>
              <p className="text-gray-400">Acesso completo a todos os doramas e filmes premium</p>
            </div>

            {/* Seleção de planos */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {PLANOS.map((plano) => (
                <button
                  key={plano.id}
                  onClick={() => setPlanoSelecionado(plano.id)}
                  className={`relative rounded-2xl p-4 border-2 text-left transition-all ${
                    planoSelecionado === plano.id
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
                  }`}
                >
                  {plano.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-600 to-rose-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full whitespace-nowrap">
                      {plano.badge}
                    </span>
                  )}
                  <p className="text-gray-400 text-xs mb-1">{plano.nome}</p>
                  <p className="text-2xl font-black text-white">{plano.preco}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{plano.periodo} de acesso</p>
                  {planoSelecionado === plano.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Benefícios */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-6">
              <p className="text-sm font-bold text-white mb-3">O que está incluído:</p>
              <div className="space-y-2.5">
                {[
                  { icon: Tv, text: 'Acesso a todos os doramas premium' },
                  { icon: Zap, text: 'Novos conteúdos toda semana' },
                  { icon: Lock, text: 'Assista no app ou no navegador' },
                  { icon: Check, text: 'Pagamento seguro via PIX' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-gray-300">
                    <Icon size={15} className="text-pink-400 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={iniciarAssinatura}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black py-4 rounded-xl text-lg transition-all active:scale-95 disabled:opacity-50 mb-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gerando PIX...
                </span>
              ) : `Assinar plano ${planoSelecionado} — ${PLANOS.find(p => p.id === planoSelecionado)?.preco}`}
            </button>

            <p className="text-center text-xs text-gray-600">
              Pagamento via PIX • Acesso liberado automaticamente após confirmação
            </p>
          </>

        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-white mb-1">Pague com PIX</h1>
              <p className="text-gray-400 text-sm">
                Plano {pix.plano} — {pix.dias} dias de acesso
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
              <div className="text-center mb-4">
                <p className="text-3xl font-black text-white">R$ {Number(pix.valor).toFixed(2).replace('.', ',')}</p>
                <p className="text-gray-500 text-sm">{pix.dias} dias de acesso premium</p>
              </div>

              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-xl">
                  {pix.qr_code_base64 ? (
                    <img src={`data:image/png;base64,${pix.qr_code_base64}`} alt="QR Code PIX" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-sm text-center">
                      Use o código abaixo
                    </div>
                  )}
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mb-4">
                Abra o app do banco → PIX → Escanear QR Code
              </p>

              <div className="bg-zinc-800 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-400 mb-2">PIX Copia e Cola:</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-300 break-all flex-1 line-clamp-2">{pix.pix_copia_cola}</p>
                  <button onClick={copiar} className={`flex-shrink-0 p-2 rounded transition-colors ${copiado ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}>
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
