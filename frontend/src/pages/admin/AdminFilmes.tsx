import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Filme, Categoria } from '../../types';
import { adminAPI, filmesAPI } from '../../services/api';
import Loading from '../../components/ui/Loading';

const vazio = (): Partial<Filme> => ({
  titulo: '', descricao: '', capa_url: '', tipo: 'filme',
  gratuito: true, valor: 0, url_video: '', destaque: false,
  lancamento: false, ano: new Date().getFullYear(), duracao: '', classificacao: '', categoria_id: '',
});

export default function AdminFilmes() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState<Partial<Filme>>(vazio());
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    const [f, c] = await Promise.all([adminAPI.filmes.listar(), filmesAPI.categorias()]);
    setFilmes(f.data);
    setCategorias(c.data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => { setForm(vazio()); setEditandoId(null); setModalAberto(true); };
  const abrirEditar = (f: Filme) => { setForm({ ...f }); setEditandoId(f.id); setModalAberto(true); };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editandoId) {
        await adminAPI.filmes.atualizar(editandoId, form as Record<string, unknown>);
        toast.success('Filme atualizado!');
      } else {
        await adminAPI.filmes.criar(form as Record<string, unknown>);
        toast.success('Filme criado!');
      }
      setModalAberto(false);
      carregar();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar filme');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este filme?')) return;
    await adminAPI.filmes.excluir(id);
    toast.success('Filme removido');
    carregar();
  };

  const set = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Filmes & Séries</h1>
        <button onClick={abrirNovo} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Adicionar
        </button>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-gray-400 text-left">
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3 hidden md:table-cell">Tipo</th>
                <th className="px-4 py-3">Acesso</th>
                <th className="px-4 py-3 hidden sm:table-cell">Valor</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filmes.map((f) => (
                <tr key={f.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {f.capa_url && <img src={f.capa_url} alt="" className="w-8 h-12 object-cover rounded flex-shrink-0" />}
                      <span className="font-medium text-white truncate max-w-[150px]">{f.titulo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell capitalize text-gray-400">{f.tipo}</td>
                  <td className="px-4 py-3">
                    {f.gratuito
                      ? <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Grátis</span>
                      : <span className="bg-netflix-red/20 text-netflix-red text-xs px-2 py-1 rounded">Premium</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-400">
                    {f.gratuito ? '—' : `R$ ${Number(f.valor).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => abrirEditar(f)} className="text-gray-400 hover:text-white p-1.5 hover:bg-zinc-600 rounded transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => excluir(f.id)} className="text-gray-400 hover:text-netflix-red p-1.5 hover:bg-zinc-600 rounded transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filmes.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Nenhum filme cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-zinc-700">
              <h2 className="text-lg font-bold">{editandoId ? 'Editar Filme' : 'Novo Filme'}</h2>
              <button onClick={() => setModalAberto(false)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Título *</label>
                  <input value={form.titulo || ''} onChange={(e) => set('titulo', e.target.value)} className="input-field" required placeholder="Nome do filme ou série" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tipo</label>
                  <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)} className="input-field">
                    <option value="filme">Filme</option>
                    <option value="serie">Série</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
                  <select value={form.categoria_id || ''} onChange={(e) => set('categoria_id', e.target.value)} className="input-field">
                    <option value="">Sem categoria</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ano</label>
                  <input type="number" value={form.ano || ''} onChange={(e) => set('ano', parseInt(e.target.value))} className="input-field" placeholder="2024" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Duração</label>
                  <input value={form.duracao || ''} onChange={(e) => set('duracao', e.target.value)} className="input-field" placeholder="2h 30min" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Classificação</label>
                  <input value={form.classificacao || ''} onChange={(e) => set('classificacao', e.target.value)} className="input-field" placeholder="16+" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">URL da Capa</label>
                  <input value={form.capa_url || ''} onChange={(e) => set('capa_url', e.target.value)} className="input-field" placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">URL do Vídeo (YouTube ou similar)</label>
                  <input value={form.url_video || ''} onChange={(e) => set('url_video', e.target.value)} className="input-field" placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Descrição</label>
                  <textarea value={form.descricao || ''} onChange={(e) => set('descricao', e.target.value)} className="input-field h-24 resize-none" placeholder="Sinopse do filme..." />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Tipo de Acesso</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={form.gratuito === true} onChange={() => set('gratuito', true)} className="accent-green-500" />
                      <span className="text-sm text-green-400">Grátis</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={form.gratuito === false} onChange={() => set('gratuito', false)} className="accent-netflix-red" />
                      <span className="text-sm text-netflix-red">Premium</span>
                    </label>
                  </div>
                </div>
                {!form.gratuito && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Valor (R$)</label>
                    <input type="number" step="0.01" min="0" value={form.valor || ''} onChange={(e) => set('valor', parseFloat(e.target.value))} className="input-field" placeholder="9.90" />
                  </div>
                )}
                <div className="md:col-span-2 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form.destaque} onChange={(e) => set('destaque', e.target.checked)} className="accent-netflix-red w-4 h-4" />
                    <span className="text-sm text-gray-300">Destacar no banner</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form.lancamento} onChange={(e) => set('lancamento', e.target.checked)} className="accent-netflix-red w-4 h-4" />
                    <span className="text-sm text-gray-300">Lançamento</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 btn-secondary py-3">Cancelar</button>
                <button type="submit" disabled={salvando} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                  <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
