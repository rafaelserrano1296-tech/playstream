import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmar) return toast.error('As senhas não conferem');
    if (senha.length < 6) return toast.error('Senha deve ter pelo menos 6 caracteres');

    setLoading(true);
    try {
      await cadastrar(nome, email, senha);
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-dark relative flex items-center justify-center px-4"
      style={{ backgroundImage: 'url(https://assets.nflxext.com/ffe/siteui/vlv3/9a5919a5-0ab1-4a52-8a1e-bf24c9c51c5e/84fc71ec-7e02-4a33-9e4e-1cc2f7af8fcb/BR-pt-20231016-popsignuptwoweeks-perspective_alpha_website_large.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="block font-black text-3xl mb-8 bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">PLAY STREAM</Link>

        <div className="bg-black/75 backdrop-blur-sm rounded-lg p-8 md:p-10">
          <h1 className="text-3xl font-bold mb-6">Criar Conta</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <div className="relative">
              <input
                type={verSenha ? 'text' : 'password'}
                placeholder="Senha (mínimo 6 caracteres)"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field pr-12"
                required
              />
              <button type="button" onClick={() => setVerSenha(!verSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <input
              type={verSenha ? 'text' : 'password'}
              placeholder="Confirmar senha"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="input-field"
              required
            />

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Criando conta...
                </span>
              ) : 'Criar Conta Grátis'}
            </button>
          </form>

          <div className="mt-8 text-gray-400">
            Já tem conta?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
