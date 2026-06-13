import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Lock, ArrowLeft, Star, Clock, Calendar, Tag, X, Copy, Check, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Filme, PagamentoPix } from '../types';
import { filmesAPI, pagamentosAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/ui/Loading';

const PLACEHOLDER = 'https://via.placeholder.com/800x1200/1a1a1a/555?text=Sem+Capa';

export default function DetalheFilme() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { autenticado } = useAuth();

  const [filme, setFilme] = useState<Filme | null>(null);
  const [loading, setLoading] = useState(true);
  const [acesso, setAcesso] = useState<{ acesso: boolean; motivo: string } | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [pix, setPix] = useState<PagamentoPix | null>(null);
  const [loadingPix, setLoadingPix] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [avisoExterno, setAvisoExterno] = useState(false);

  useEffect(() => {
    if (!id) return;
    const carregar = async () => {
      try {
        const res = await filmesAPI.buscar(id);
        setFilme(res.data);
        if (autenticado) {
          const acessoRes = await filmesAPI.verificarAcesso(id);
          setAcesso(acessoRes.data);
        } else {
          setAcesso({ acesso: res.data.gratuito, motivo: res.data.gratuito ? 'gratuito' : 'login_necessario' });
        }
      } catch {
        toast.error('Filme não encontrado');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [id, autenticado]);

  const handleAssistir = () => {
    if (!filme) return;

    if (acesso?.acesso) {
      setAvisoExterno(true);
      return;
    }

    if (!autenticado) {
      toast.error('Faça login para acessar este conteúdo');
      navigate('/login');
      return;
    }

    // Abrir modal de pagamento
    setModalAberto(true);
    iniciarPagamento();
  };

  const abrirVideo = () => {
    if (filme?.url_video) {
      window.open(filme.url_video, '_blank', 'noopener,noreferrer');
    }
    setAvisoExterno(false);
  };

  const iniciarPagamento = async () => {
    if (!id) return;
    setLoadingPix(true);
    try {
      const res = await pagamentosAPI.iniciar(id);
      setPix(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao gerar pagamento');
      setModalAberto(false);
    } finally {
      setLoadingPix(false);
    }
  };

  const copiarPix = async () => {
    if (!pix?.pix_copia_cola) return;
    await navigator.clipboard.writeText(pix.pix_copia_cola);
    setCopiado(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopiado(false), 3000);
  };

  const verificarPagamento = useCallback(async () => {
    if (!pix?.txid || verificando) return;
    setVerificando(true);
    try {
      const res = await pagamentosAPI.verificar(pix.txid);
      if (res.data.status === 'aprovado') {
        toast.success('Pagamento confirmado! Acesso liberado.');
        setModalAberto(false);
        setAcesso({ acesso: true, motivo: 'comprado' });
      } else {
        toast.error('Pagamento ainda não confirmado. Aguarde alguns instantes.');
      }
    } catch {
      toast.error('Erro ao verificar pagamento');
    } finally {
      setVerificando(false);
    }
  }, [pix?.txid, verificando]);

  if (loading) return <Loading fullScreen />;
  if (!filme) return null;

  return (
    <div className="min-h-screen bg-netflix-dark">
      {/* Hero */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={filme.capa_url || PLACEHOLDER}
          alt={filme.titulo}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-transparent to-black/30" />

        <button onClick={() => navigate(-1)}
          className="absolute top-20 left-4 md:left-8 flex items-center gap-2 text-white hover:text-gray-300 transition-colors bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>

      {/* Detalhes */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-32 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Capa lateral (desktop) */}
          <div className="hidden md:block flex-shrink-0 w-48">
            <img
              src={filme.capa_url || PLACEHOLDER}
              alt={filme.titulo}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-3">
              {filme.gratuito ? (
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">GRÁTIS</span>
              ) : (
                <span className="bg-netflix-red text-white text-xs font-bold px-3 py-1 rounded-full">PREMIUM</span>
              )}
              <span className="text-gray-400 text-sm capitalize">{filme.tipo}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
              {filme.titulo}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
              {filme.avaliacao && filme.avaliacao > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star size={14} fill="currentColor" /> {filme.avaliacao}
                </span>
              )}
              {filme.ano && <span className="flex items-center gap-1"><Calendar size={14} /> {filme.ano}</span>}
              {filme.duracao && <span className="flex items-center gap-1"><Clock size={14} /> {filme.duracao}</span>}
              {filme.classificacao && <span className="border border-gray-500 px-2 py-0.5 rounded text-xs">{filme.classificacao}</span>}
              {filme.categoria_nome && (
                <span className="flex items-center gap-1"><Tag size={14} /> {filme.categoria_nome}</span>
              )}
            </div>

            {filme.descricao && (
              <p className="text-gray-300 text-base leading-relaxed mb-6">{filme.descricao}</p>
            )}

            {/* Preço */}
            {!filme.gratuito && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm">Acesso único por</p>
                <p className="text-3xl font-black text-white">R$ {Number(filme.valor).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Pagamento via PIX • Liberação imediata</p>
              </div>
            )}

            {/* Botão assistir */}
            <button
              onClick={handleAssistir}
              className="flex items-center gap-3 btn-primary text-lg py-4 px-8 w-full md:w-auto justify-center"
            >
              {acesso?.acesso ? (
                <><Play size={22} fill="white" /> Assistir Agora</>
              ) : !autenticado ? (
                <><Lock size={20} /> Entrar para Assistir</>
              ) : (
                <><Lock size={20} /> Comprar Acesso — R$ {Number(filme.valor).toFixed(2)}</>
              )}
            </button>

            {acesso?.motivo === 'comprado' && (
              <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                <Check size={14} /> Você já possui acesso a este conteúdo
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal aviso externo */}
      {avisoExterno && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full animate-scale-in text-center">
            <ExternalLink size={40} className="text-netflix-red mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Abrindo Conteúdo Externo</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Este conteúdo será aberto em uma nova aba em uma plataforma externa (YouTube ou similar).
            </p>
            <div className="flex gap-3">
              <button onClick={() => setAvisoExterno(false)} className="flex-1 btn-secondary py-3">
                Cancelar
              </button>
              <button onClick={abrirVideo} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                <ExternalLink size={16} /> Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal PIX */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full my-4 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Pagamento via PIX</h3>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-white">
                <X size={22} />
              </button>
            </div>

            {loadingPix ? (
              <div className="flex flex-col items-center py-8 gap-4">
                <div className="w-10 h-10 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400">Gerando QR Code PIX...</p>
              </div>
            ) : pix ? (
              <>
                <div className="text-center mb-6">
                  <p className="text-gray-400 text-sm mb-1">{filme.titulo}</p>
                  <p className="text-3xl font-black text-white">R$ {Number(pix.valor_pago).toFixed(2)}</p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG value={pix.pix_copia_cola} size={200} />
                  </div>
                </div>

                <p className="text-center text-xs text-gray-400 mb-4">
                  Abra o app do seu banco, vá em PIX e escaneie o QR Code
                </p>

                {/* Pix Copia e Cola */}
                <div className="bg-zinc-800 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-400 mb-2">PIX Copia e Cola:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-300 break-all flex-1 line-clamp-2">{pix.pix_copia_cola}</p>
                    <button onClick={copiarPix} className={`flex-shrink-0 p-2 rounded transition-colors ${copiado ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}>
                      {copiado ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expiração */}
                {pix.data_expiracao && (
                  <p className="text-center text-xs text-yellow-400 mb-4">
                    ⏱ Este QR Code expira em 30 minutos
                  </p>
                )}

                <button
                  onClick={verificarPagamento}
                  disabled={verificando}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {verificando ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verificando...
                    </span>
                  ) : 'Já Paguei — Verificar Pagamento'}
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
