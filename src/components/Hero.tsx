"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import Counter from './Counter';

interface HeroProps {
  data?: {
    badge?: string;
    title_part1?: string;
    title_part2?: string;
    title_part3?: string;
    description?: string;
    cta_text?: string;
    trust_subtitle?: string;
  };
}

export default function Hero({ data }: HeroProps) {
  const badge = data?.badge || "Hub de Empresas 100% Homologadas";
  const title_part1 = data?.title_part1 || "CONTRATE COM";
  const title_part2 = data?.title_part2 || "SEGURANÇA";
  const title_part3 = data?.title_part3 || "E ECONOMIA";
  const description = data?.description || "Sua plataforma definitiva para contratar serviços homologados de automação, energia limpa, segurança e climatização com total tranquilidade.";
  const cta_text = data?.cta_text || "Solicitar Orçamento Grátis";
  const trust_subtitle = data?.trust_subtitle || "Clientes satisfeitos em SC";

  const handleScrollToForm = () => {
    const element = document.getElementById('lead-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center lg:items-start text-center lg:text-left">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-emerald/10 text-brand-emerald text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-8 border border-brand-emerald/20 shadow-sm backdrop-blur-md animate-float">
          <ShieldCheck className="w-4 h-4" /> {badge}
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-[5.5rem] font-montserrat font-black text-brand-navy dark:text-slate-100 leading-[0.95] mb-8 uppercase tracking-tighter">
          {title_part1} <br className="hidden lg:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-emerald-400">{title_part2}</span> <br className="hidden lg:block" />
          {title_part3}
        </h1>

        <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-6 mb-12">
          <button 
            onClick={handleScrollToForm}
            className="group relative w-full sm:w-auto bg-brand-orange text-white font-black py-5 px-12 rounded-2xl shadow-2xl shadow-orange-500/40 transition-all hover:scale-105 active:scale-95 text-base md:text-lg uppercase tracking-widest flex items-center justify-center gap-3 overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
             {cta_text}
             <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          
          <div className="flex flex-col items-center lg:items-start gap-2 sm:ml-4">
            <div className="flex -space-x-3">
              {[
                { src: '/service_solar.png', alt: 'Energia Solar' },
                { src: '/service_automation.png', alt: 'Automação' },
                { src: '/service_security.png', alt: 'Segurança' },
                { src: '/service_ac.png', alt: 'Climatização' },
              ].map((service, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden shadow-lg"
                >
                  <img src={service.src} alt={service.alt} className="w-full h-full object-cover" />
                </motion.div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-brand-emerald flex items-center justify-center text-[10px] text-white font-black shadow-lg">
                +<Counter target={250} />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{trust_subtitle}</p>
          </div>
        </div>


        {/* Badges de Confiança - Floating Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-8 w-full max-w-xl pt-10 border-t border-slate-200/50 dark:border-slate-800/50">
          {[
            { icon: CheckCircle, text: "Empresas Auditadas" },
            { icon: MapPin, text: "Foco em Santa Catarina" },
            { icon: ShieldCheck, text: "Suporte Pós-Venda" },
          ].map((badge, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="flex items-center gap-3 text-slate-500 dark:text-slate-400 group cursor-default"
            >
              <div className="p-2 rounded-lg bg-brand-emerald/10 text-brand-emerald transition-colors group-hover:bg-brand-emerald group-hover:text-white">
                <badge.icon className="w-5 h-5" />
              </div>
              <span className="text-xs md:text-sm font-black uppercase tracking-widest text-left leading-tight text-brand-navy dark:text-slate-300">
                {badge.text}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
