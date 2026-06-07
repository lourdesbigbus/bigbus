"use client";

import React, { useState } from 'react';
import { createLeadAction } from '@/app/actions/leads';
import { env } from '@/config/env';
import { servicesConfig } from '@/config/services';
import { getSiteSettingsAction } from '@/app/actions/settings';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';

export default function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    localizacao: '',
    servico: servicesConfig[0].title,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createLeadAction({
        nome: formData.nome,
        whatsapp: formData.whatsapp,
        localizacao: formData.localizacao,
        servico: formData.servico,
        status: 'Pendente',
        perda_estimada: 0 
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      setSubmitted(true);
      
      let numeroDestino = env.whatsappNumber;
      try {
        const settingsRes = await getSiteSettingsAction('general');
        if (settingsRes.success && settingsRes.data) {
          const generalData = settingsRes.data as any;
          if (generalData.whatsappNumber) {
            numeroDestino = generalData.whatsappNumber;
          }
        }
      } catch (err) {
        console.error('Erro ao buscar whatsapp do CMS, usando default:', err);
      }

      const mensagem = `Olá! Meu nome é ${formData.nome}. Gostaria de solicitar uma análise técnica gratuita para ${formData.servico} em ${formData.localizacao}.`;
      const url = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensagem)}`;
      setTimeout(() => window.open(url, '_blank'), 1500);
      
    } catch (err: any) {
      console.error('Erro ao processar lead:', err);
      alert('Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="px-6 py-20 max-w-lg mx-auto w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass dark:glass-dark p-12 rounded-[3rem] border border-brand-emerald/30 shadow-2xl"
        >
          <div className="w-20 h-20 bg-brand-emerald rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-montserrat font-black text-brand-navy dark:text-white uppercase mb-4 tracking-tighter">Solicitação Enviada!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Obrigado, {formData.nome.split(' ')[0]}! Estamos redirecionando você para o nosso WhatsApp para agilizar sua análise técnica.</p>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="lead-form" className="px-6 py-24 max-w-xl mx-auto w-full mb-16 z-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass dark:glass-dark rounded-[3rem] shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/40 dark:border-slate-800/50 p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald/5 blur-3xl -z-10" />
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-montserrat font-black text-brand-navy dark:text-slate-100 uppercase tracking-tighter leading-tight">
            SOLICITAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-emerald-400">ANÁLISE TÉCNICA</span> GRATUITA
          </h2>
          <div className="w-16 h-1 bg-brand-emerald mx-auto rounded-full mt-4 mb-6" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
            Nossos especialistas do <strong className="text-brand-navy dark:text-white">Hubly Pro</strong> entrarão em contato em até 24h.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="group">
              <label className="block text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors group-focus-within:text-brand-emerald">Nome Completo</label>
              <input 
                required
                type="text" 
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all shadow-inner"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors group-focus-within:text-brand-emerald">WhatsApp</label>
              <input 
                required
                type="tel" 
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all shadow-inner"
                placeholder="(48) 99999-9999"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors group-focus-within:text-brand-emerald">Cidade / Localização</label>
              <input 
                required
                type="text" 
                name="localizacao"
                value={formData.localizacao}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all shadow-inner"
                placeholder="Ex: Florianópolis, SC"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors group-focus-within:text-brand-emerald">Serviço de Interesse</label>
              <div className="relative">
                <select 
                  name="servico"
                  value={formData.servico}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium dark:text-white focus:outline-none focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all shadow-inner appearance-none cursor-pointer"
                >
                  {servicesConfig.map(s => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Send className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="group relative w-full bg-brand-orange text-white font-black py-5 rounded-2xl shadow-2xl shadow-orange-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] mt-8 text-base tracking-[0.1em] uppercase overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? 'Processando...' : 'Receber Análise Gratuita'}
              {!loading && <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
            </span>
          </button>
          
          <p className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest opacity-60">
            🔒 Seus dados estão 100% seguros com o Hubly Pro
          </p>
        </form>
      </motion.div>
    </section>
  );
}
