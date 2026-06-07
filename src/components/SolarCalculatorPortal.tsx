"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, Sun, TrendingUp, Leaf, Clock, CheckCircle2, RotateCcw, Send } from 'lucide-react';
import { createLeadAction } from '@/app/actions/leads';
import { env } from '@/config/env';
import { calcularSolar as calcular, ufFromCep, CalcResult } from '@/config/solar';
import { getSiteSettingsAction } from '@/app/actions/settings';

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function SolarCalculatorPortal() {
  const [activeTab, setActiveTab]   = useState<'simulacao' | 'resumo'>('simulacao');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<CalcResult | null>(null);
  const [submitted, setSubmitted]   = useState(false);

  const [formData, setFormData] = useState({
    cep:           '',
    uf:            '',
    valorConta:    '',
    concessionaria:'',
    email:         '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'cep') {
      // Auto-format CEP and resolve UF
      const digits = value.replace(/\D/g, '').slice(0, 8);
      const formatted = digits.length > 5 ? `${digits.slice(0,5)}-${digits.slice(5)}` : digits;
      const uf = ufFromCep(digits);
      setFormData(prev => ({ ...prev, cep: formatted, uf }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = Number(formData.valorConta);
    if (!valorNum || valorNum <= 0) return;

    setLoading(true);

    const calc = calcular(valorNum, formData.concessionaria, formData.uf || 'SC');
    setResult(calc);

    // Save lead to Supabase using Server Action
    try {
      await createLeadAction({
        nome:           'Lead Calculadora Solar',
        whatsapp:       '', // no whatsapp input in this specific form
        localizacao:    formData.uf || '',
        servico:        'Instalação e Manutenção',
        status:         'Pendente',
        perda_estimada: calc.economiaA,
        email:          formData.email,
        cep:            formData.cep,
        concessionaria: formData.concessionaria,
        valor_conta:    valorNum,
      });
    } catch {
      // Silent fail - calculation still shows
    }

    setLoading(false);
    setActiveTab('resumo');
  };

  const handleWhatsApp = async () => {
    if (!result) return;
    let numero = env.whatsappNumber;
    try {
      const settingsRes = await getSiteSettingsAction('general');
      if (settingsRes.success && settingsRes.data) {
        const generalData = settingsRes.data as any;
        if (generalData.whatsappNumber) {
          numero = generalData.whatsappNumber;
        }
      }
    } catch (err) {
      console.error('Erro ao buscar whatsapp do CMS na calculadora:', err);
    }
    const msg = `Olá! Fiz uma simulação na Hubly Pro e meu potencial de economia solar é de *${fmt(result.economiaA)}/ano* com um sistema de *${result.potencia} kWp*. Quero saber mais!`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

      {/* ── Left: Branding ─────────────────────────────────────────────── */}
      <div className="flex-1 text-center lg:text-left space-y-8">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-black uppercase tracking-[0.2em] border border-brand-emerald/20">
          <Zap className="w-4 h-4 fill-brand-emerald" /> Hubly Pro Solar
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-montserrat font-black text-brand-navy dark:text-white uppercase leading-[0.95] tracking-tighter">
          VAMOS JUNTOS<br />PARA O{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-yellow-400">FUTURO</span>
          <br />DA ENERGIA.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-xl">
          A marca <strong className="text-brand-navy dark:text-brand-emerald">líder</strong> em curadoria de energia solar em Santa Catarina.
          Simule agora e descubra seu <strong className="text-brand-navy dark:text-white">potencial real de economia.</strong>
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center justify-center lg:justify-start gap-6 pt-4">
          <div className="flex flex-col">
            <span className="text-3xl font-black text-brand-navy dark:text-white">+1.200</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistemas Homologados</span>
          </div>
          <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-3xl font-black text-brand-navy dark:text-white">98%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Satisfação Técnica</span>
          </div>
          <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-3xl font-black text-brand-navy dark:text-white">SC</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estados Atendidos</span>
          </div>
        </motion.div>
      </div>

      {/* ── Right: Calculator Card ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-slate-800 p-2 overflow-hidden">

        {/* Tabs */}
        <div className="flex p-1 mb-2 bg-slate-50 dark:bg-slate-950 rounded-[1.8rem]">
          {(['simulacao', 'resumo'] as const).map(tab => (
            <button key={tab} onClick={() => tab === 'simulacao' && setActiveTab(tab)}
              disabled={tab === 'resumo' && !result}
              className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-900 text-brand-emerald shadow-md'
                  : 'text-slate-400 disabled:opacity-30 hover:text-slate-600 dark:hover:text-slate-300'
              }`}>
              {tab === 'simulacao' ? 'Simulação' : 'Resumo'}
            </button>
          ))}
        </div>

        <div className="px-6 pb-8 pt-2">
          <AnimatePresence mode="wait">
            {/* ── Simulation Form ── */}
            {activeTab === 'simulacao' && (
              <motion.div key="simulacao"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-5">
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-brand-emerald rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                    <Sun className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-brand-navy dark:text-white uppercase tracking-tight">Calculadora Solar</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Economize até 95% na sua conta de luz</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* CEP + UF */}
                  <div className="flex gap-3">
                    <div className="flex-[2]">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">CEP</label>
                      <input type="text" name="cep" placeholder="00000-000"
                        value={formData.cep} onChange={handleChange} required
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold dark:text-white focus:outline-none focus:border-brand-emerald transition-all" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">UF</label>
                      <input type="text" name="uf" placeholder="—"
                        value={formData.uf} readOnly
                        className="w-full p-3.5 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-sm font-black text-brand-emerald text-center cursor-default focus:outline-none" />
                    </div>
                  </div>

                  {/* Bill value */}
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Valor da Conta de Luz</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">R$</span>
                      <input type="number" name="valorConta" placeholder="0,00" min="1"
                        value={formData.valorConta} onChange={handleChange} required
                        className="w-full p-3.5 pl-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold dark:text-white focus:outline-none focus:border-brand-emerald transition-all" />
                    </div>
                  </div>

                  {/* Concessionária */}
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Concessionária</label>
                    <select name="concessionaria" value={formData.concessionaria} onChange={handleChange} required
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold dark:text-white focus:outline-none focus:border-brand-emerald transition-all appearance-none cursor-pointer">
                      <option value="">Selecione sua distribuidora</option>
                      <option value="celesc">CELESC – SC / RS</option>
                      <option value="edp">EDP – SP / ES</option>
                      <option value="enel">ENEL – RJ / CE / GO</option>
                      <option value="outra">Outra distribuidora</option>
                    </select>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">E-mail para receber os resultados</label>
                    <input type="email" name="email" placeholder="seu@email.com"
                      value={formData.email} onChange={handleChange} required
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold dark:text-white focus:outline-none focus:border-brand-emerald transition-all" />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-brand-orange hover:bg-orange-400 disabled:opacity-70 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 tracking-widest text-xs uppercase flex items-center justify-center gap-2">
                    {loading ? 'Calculando...' : <><span>Simule Grátis!</span><ArrowRight className="w-4 h-4" /></>}
                  </button>

                  <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                    🔒 Seus dados estão 100% seguros
                  </p>
                </form>
              </motion.div>
            )}

            {/* ── Results ── */}
            {activeTab === 'resumo' && result && (
              <motion.div key="resumo"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-5 py-3">
                <div className="text-center">
                  <div className="w-14 h-14 bg-brand-emerald rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-brand-navy dark:text-white uppercase tracking-tight">Seu Potencial Solar</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Simulação baseada no seu CEP e concessionária</p>
                </div>

                {/* Main savings highlight */}
                <div className="bg-gradient-to-br from-brand-emerald/5 to-emerald-500/10 dark:from-brand-emerald/10 dark:to-emerald-500/20 p-5 rounded-3xl border border-brand-emerald/20 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Economia Mensal Estimada</p>
                  <p className="text-4xl font-black text-brand-emerald">{fmt(result.economiaM)}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">{fmt(result.economiaA)}/ano · {fmt(result.economia25)} em 25 anos</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sistema</span>
                    </div>
                    <p className="text-lg font-black text-brand-navy dark:text-white">{result.potencia} kWp</p>
                    <p className="text-[10px] text-slate-400 font-bold">{result.geracao} kWh/mês</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payback</span>
                    </div>
                    <p className="text-lg font-black text-brand-navy dark:text-white">
                      {result.payback >= 12 ? `${Math.floor(result.payback / 12)} anos` : `${result.payback} meses`}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">retorno do investimento</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-brand-orange" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custo Estimado</span>
                    </div>
                    <p className="text-lg font-black text-brand-navy dark:text-white">{fmt(result.custoProjeto)}</p>
                    <p className="text-[10px] text-slate-400 font-bold">instalação completa</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Leaf className="w-4 h-4 text-green-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CO₂ Evitado</span>
                    </div>
                    <p className="text-lg font-black text-brand-navy dark:text-white">{result.co2Anual.toLocaleString('pt-BR')} kg</p>
                    <p className="text-[10px] text-slate-400 font-bold">por ano</p>
                  </div>
                </div>

                <button onClick={handleWhatsApp}
                  className="w-full bg-brand-emerald hover:bg-emerald-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Falar com especialista agora
                </button>

                <button onClick={() => { setActiveTab('simulacao'); setResult(null); }}
                  className="w-full flex items-center justify-center gap-1.5 text-slate-400 hover:text-brand-navy dark:hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Refazer simulação
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
