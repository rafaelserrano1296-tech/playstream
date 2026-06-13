import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Download, Smartphone, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { podeInstalar, instalado, instalar } = usePWAInstall();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Bem-vindo de volta!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          PLAY STREAM
        </h1>
        <p className="text-gray-500 text-sm mt-1">Sua plataforma de streaming</p>
      </div>

      <div className="w-full max-w-md space-y-4">

        {/* Botão de Download — bem destacado */}
        {!instalado ? (
          <button
            onClick={podeInstalar ? instalar : undefined}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-lg shadow-purple-900/50 transition-all active:scale-95 border border-purple-500/30"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Download size={22} />
            </div>
            <div className="text-left">
              <p className="text-base font-black leading-tight">Baixar App Grátis</p>
              <p className="text-purple-200 text-xs font-normal">Instale na tela inicial do seu celular</p>
            </div>
            <Smartphone size={20} className="ml-auto text-purple-300" />
          </button>
        ) : (
          <div className="w-full bg-green-900/30 border border-green-500/30 text-green-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-3">
            <Check size={20} /> App já instalado no seu dispositivo!
          </div>
        )}

        {/* Card de login */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-5 text-center">Entrar na sua conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="relative">
              <input
                type={verSenha ? 'text' : 'password'}
                placeholder="Sua senha"
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

            <div className="text-right">
              <Link to="/recuperar-senha" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Esqueceu a senha?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-netflix-red hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-95">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>

          <div className="mt-5 text-center text-gray-500 text-sm">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-white font-semibold hover:text-purple-400 transition-colors">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
