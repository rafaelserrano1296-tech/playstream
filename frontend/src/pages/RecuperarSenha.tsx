import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { ArrowLeft, Mail } from 'lucide-react';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.solicitarReset(email);
      setEnviado(true);
    } catch {
      toast.error('Erro ao enviar e-mail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-netflix-red font-black text-3xl mb-8">STREAMFLIX</Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          {enviado ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-netflix-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-netflix-red" />
              </div>
              <h2 className="text-2xl font-bold mb-2">E-mail enviado!</h2>
              <p className="text-gray-400 mb-6">
                Se o e-mail estiver cadastrado, você receberá as instruções em breve. Verifique sua caixa de spam.
              </p>
              <Link to="/login" className="btn-primary inline-block">Voltar ao login</Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors">
                <ArrowLeft size={16} /> Voltar
              </Link>
              <h1 className="text-2xl font-bold mb-2">Recuperar Senha</h1>
              <p className="text-gray-400 mb-6 text-sm">Digite seu e-mail e enviaremos instruções para redefinir sua senha.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
                <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                  {loading ? 'Enviando...' : 'Enviar Instruções'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
