import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState<{ nome?: string; email?: string; senha?: string; confirmar?: string; geral?: string }>({});
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const validar = () => {
    const novosErros: typeof erros = {};
    if (!nome.trim()) novosErros.nome = 'Digite seu nome completo';
    if (!email.trim()) novosErros.email = 'Digite seu e-mail';
    else if (!/\S+@\S+\.\S+/.test(email)) novosErros.email = 'E-mail inválido';
    if (!senha) novosErros.senha = 'Digite uma senha';
    else if (senha.length < 6) novosErros.senha = 'Senha deve ter pelo menos 6 caracteres';
    if (!confirmar) novosErros.confirmar = 'Confirme sua senha';
    else if (senha !== confirmar) novosErros.confirmar = 'As senhas não conferem';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    setLoading(true);
    setErros({});
    try {
      await cadastrar(nome, email, senha);
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro ao criar conta';
      if (msg.includes('já cadastrado') || msg.includes('already')) {
        setErros({ email: 'Este e-mail já está cadastrado. Tente fazer login.' });
      } else {
        setErros({ geral: msg });
      }
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

          {erros.geral && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 mb-4 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {erros.geral}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => { setNome(e.target.value); setErros(p => ({ ...p, nome: undefined })); }}
                className={`input-field ${erros.nome ? 'border-red-500' : ''}`}
              />
              {erros.nome && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{erros.nome}</p>}
            </div>

            <div>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErros(p => ({ ...p, email: undefined })); }}
                className={`input-field ${erros.email ? 'border-red-500' : ''}`}
              />
              {erros.email && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{erros.email}</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  type={verSenha ? 'text' : 'password'}
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setErros(p => ({ ...p, senha: undefined })); }}
                  className={`input-field pr-12 ${erros.senha ? 'border-red-500' : ''}`}
                />
                <button type="button" onClick={() => setVerSenha(!verSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {erros.senha && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{erros.senha}</p>}
            </div>

            <div>
              <input
                type={verSenha ? 'text' : 'password'}
                placeholder="Confirmar senha"
                value={confirmar}
                onChange={(e) => { setConfirmar(e.target.value); setErros(p => ({ ...p, confirmar: undefined })); }}
                className={`input-field ${erros.confirmar ? 'border-red-500' : ''}`}
              />
              {erros.confirmar && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{erros.confirmar}</p>}
            </div>

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
