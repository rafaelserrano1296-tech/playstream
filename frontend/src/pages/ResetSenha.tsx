import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetSenha() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmar) return toast.error('As senhas não conferem');
    setLoading(true);
    try {
      await authAPI.resetarSenha(token, novaSenha);
      toast.success('Senha alterada com sucesso!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Token inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="min-h-screen bg-netflix-dark flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Link inválido.</p>
        <Link to="/recuperar-senha" className="btn-primary">Solicitar novo link</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-netflix-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-netflix-red font-black text-3xl mb-8">STREAMFLIX</Link>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-2">Nova Senha</h1>
          <p className="text-gray-400 mb-6 text-sm">Defina sua nova senha abaixo.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={verSenha ? 'text' : 'password'}
                placeholder="Nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="input-field pr-12"
                required minLength={6}
              />
              <button type="button" onClick={() => setVerSenha(!verSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <input
              type={verSenha ? 'text' : 'password'}
              placeholder="Confirmar nova senha"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="input-field"
              required
            />
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
