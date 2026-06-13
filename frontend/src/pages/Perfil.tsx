import React, { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Perfil() {
  const { usuario } = useAuth();
  const [nome, setNome] = useState(usuario?.nome || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'perfil' | 'senha'>('perfil');

  const salvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Record<string, string> = { nome };
      if (abaAtiva === 'senha') {
        if (!senhaAtual || !novaSenha) return toast.error('Preencha todos os campos de senha');
        if (novaSenha.length < 6) return toast.error('Nova senha deve ter pelo menos 6 caracteres');
        payload.senhaAtual = senhaAtual;
        payload.novaSenha = novaSenha;
      }
      await api.put('/usuarios/perfil', payload);
      toast.success('Perfil atualizado com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-dark pt-24 px-4 md:px-8 pb-16">
      <div className="max-w-2xl mx-auto">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-netflix-red rounded-full flex items-center justify-center text-3xl font-black">
            {usuario?.nome[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{usuario?.nome}</h1>
            <p className="text-gray-400">{usuario?.email}</p>
            {usuario?.role === 'admin' && (
              <span className="text-xs bg-netflix-red/20 text-netflix-red border border-netflix-red/30 px-2 py-0.5 rounded mt-1 inline-block">
                Administrador
              </span>
            )}
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-1 mb-6 bg-zinc-900 p-1 rounded-lg w-fit">
          <button
            onClick={() => setAbaAtiva('perfil')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${abaAtiva === 'perfil' ? 'bg-zinc-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <User size={15} /> Perfil
          </button>
          <button
            onClick={() => setAbaAtiva('senha')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${abaAtiva === 'senha' ? 'bg-zinc-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Lock size={15} /> Senha
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <form onSubmit={salvarPerfil} className="space-y-4">
            {abaAtiva === 'perfil' ? (
              <>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Nome</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">E-mail</label>
                  <input type="email" value={usuario?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
                  <p className="text-xs text-gray-500 mt-1">O e-mail não pode ser alterado</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Senha Atual</label>
                  <input
                    type="password"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    className="input-field"
                    placeholder="Digite sua senha atual"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Nova Senha</label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="input-field"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 py-3 px-6 disabled:opacity-50">
              <Save size={16} />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
