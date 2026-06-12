"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-emerald/10 dark:bg-brand-emerald/5 blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-[#DC2626] dark:text-red-400 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center font-montserrat">Área Administrativa</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2 px-2 leading-relaxed">
            Digite o e-mail mestre e a senha para acessar os leads do CRM.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail mestre..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all shadow-inner"
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all shadow-inner"
            />
          </div>

          <div className="flex justify-end pr-1">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium transition-all"
            >
              Esqueci a senha
            </button>
          </div>

          {error && <p className="text-[#FF4444] text-xs font-bold text-center animate-pulse">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-600/20 transition-all uppercase cursor-pointer"
          >
            {loading ? 'Entrando...' : 'ACESSAR CRM'}
          </button>
        </form>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-sm w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Esqueceu sua senha?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Por motivos de segurança, a senha é configurada diretamente no servidor do sistema. 
              <br /><br />
              Para recuperar ou redefinir suas credenciais, verifique o arquivo <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> na raiz do projeto (variáveis <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">ADMIN_EMAIL</code> e <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">ADMIN_PASSWORD</code>).
            </p>
            <button 
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-3 rounded-xl transition-all cursor-pointer"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
