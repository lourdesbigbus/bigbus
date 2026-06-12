"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Key, Eye, EyeOff, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import { getAdminEmailAction, updateAdminCredentialsAction } from '@/app/actions/settings';

export default function AdminSecurity() {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');

  // Password visibility states
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current admin email on load
  useEffect(() => {
    async function fetchEmail() {
      try {
        const res = await getAdminEmailAction();
        if (res.success && res.email) {
          setEmail(res.email);
        } else {
          setMessage({ type: 'error', text: res.error || 'Erro ao carregar o e-mail atual.' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Erro de conexão ao carregar e-mail.' });
      } finally {
        setLoadingEmail(false);
      }
    }
    fetchEmail();
  }, []);

  const handleClear = () => {
    setNovaSenha('');
    setConfirmarSenha('');
    setSenhaAtual('');
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'O e-mail mestre é obrigatório.' });
      return;
    }

    if (novaSenha) {
      if (novaSenha.length < 8) {
        setMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 8 caracteres.' });
        return;
      }
      if (novaSenha !== confirmarSenha) {
        setMessage({ type: 'error', text: 'A confirmação de senha não coincide com a nova senha.' });
        return;
      }
    }

    if (!senhaAtual) {
      setMessage({ type: 'error', text: 'A senha atual é obrigatória para salvar as alterações.' });
      return;
    }

    setLoading(true);

    try {
      const res = await updateAdminCredentialsAction({
        email,
        novaSenha: novaSenha || undefined,
        senhaAtual
      });

      if (res.success) {
        setMessage({ 
          type: 'success', 
          text: 'Credenciais atualizadas com sucesso! Redirecionando para a tela de login...' 
        });
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Erro ao atualizar credenciais.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão ao salvar.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Configurações de Segurança</h1>
        <p className="text-xs text-slate-500 mt-1">Gerencie as credenciais mestre de acesso do administrador.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Card Settings Form (Left/Center - 2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/20">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-red-500" />
              Alterar E-mail e Senha Mestre
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Atualize o e-mail ou defina uma nova senha para o acesso de administrador geral.
            </p>
          </div>

          {loadingEmail ? (
            <div className="p-12 text-center">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-red-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-400">Carregando dados...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  E-mail Mestre *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@hubly.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Segurança e Senha
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Nova Senha (Opcional)
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                      <input
                        type={showNovaSenha ? 'text' : 'password'}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        placeholder="Mínimo de 8 caracteres"
                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNovaSenha(!showNovaSenha)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-all"
                      >
                        {showNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                      <input
                        type={showConfirmarSenha ? 'text' : 'password'}
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-all"
                      >
                        {showConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authorization Section */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Autorização e Confirmação
                </h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                    Senha Atual * (Necessária para salvar alterações)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-red-400 absolute left-4 top-3.5" />
                    <input
                      type={showSenhaAtual ? 'text' : 'password'}
                      required
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      placeholder="Confirme sua senha administrativa atual"
                      className="w-full pl-11 pr-11 py-3 bg-white border border-red-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all font-semibold shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-all"
                    >
                      {showSenhaAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Buttons Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-5 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Limpar Campos
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/10 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Side Warning Panel (Right - 1 Col) */}
        <div className="bg-[#1E293B] text-slate-300 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-6">
          {/* Security Warning Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold text-[11px] uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              Aviso de Segurança
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              As credenciais mestre fornecem controle total sobre os dados do CRM e a edição de conteúdos institucionais.
            </p>
          </div>

          {/* Best Practices */}
          <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">
              Boas Práticas:
            </h4>
            <ul className="text-[11px] text-slate-400 space-y-2 list-disc list-inside leading-relaxed pl-1">
              <li>Use uma senha que não seja idêntica a de outros serviços.</li>
              <li>Misture letras maiúsculas, minúsculas, números e caracteres especiais.</li>
              <li>Nunca compartilhe esta senha por e-mail ou canais de chat abertos.</li>
            </ul>
          </div>

          {/* Session Expiry Notification */}
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl space-y-1.5">
            <p className="text-[11px] font-bold leading-relaxed text-amber-300">
              Importante: Alterar o e-mail ou a senha administrativa removerá seu cookie de sessão ativa. Você precisará realizar um novo login imediatamente.
            </p>
          </div>

          {/* Footer Text */}
          <div className="text-center pt-2 text-[10px] text-slate-500 border-t border-slate-800/80 font-medium font-mono">
            Hubly CRM • Painel de Segurança
          </div>
        </div>
      </div>
    </div>
  );
}
