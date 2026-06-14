"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, BadgeCheck, Zap, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Vistoria Completa",
    description: "Vistoria cautelar rigorosa, checagem completa de histórico e documentação de todos os veículos cadastrados."
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Garantia e Procedência",
    description: "Todos os veículos contam com garantia e procedência garantida pela BigBus, oferecendo segurança total na sua compra."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Melhores Taxas",
    description: "Parcerias fortes com os maiores bancos do país para oferecer a menor taxa de financiamento e aprovação de crédito ágil."
  }
];

interface TrustStep {
  title: string;
  description: string;
}

interface TrustData {
  badge?: string;
  title_part1?: string;
  title_part2?: string;
  description?: string;
  certified_title?: string;
  certified_desc?: string;
  steps?: TrustStep[];
}

interface TrustSectionProps {
  data?: TrustData;
}

export default function TrustSection({ data }: TrustSectionProps) {
  const badge = data?.badge || "Transparência & Segurança";
  const title_part1 = data?.title_part1 || "POR QUE COMPRAR OU";
  const title_part2 = data?.title_part2 || "VENDER COM A BIGBUS?";
  const descriptionText = data?.description || "Oferecemos uma intermediação segura e simplificada. Cuidamos de toda a burocracia, vistoria e financiamento para você fazer o melhor negócio sem dores de cabeça.";
  const certified_title = data?.certified_title || "Certificação de Procedência";
  const certified_desc = data?.certified_desc || "Todos os nossos carros, vans, ônibus e motorhomes passam por uma avaliação mecânica e estética de mais de 150 itens.";

  const stepIcons = [
    <Search className="w-6 h-6" key="search" />,
    <ShieldCheck className="w-6 h-6" key="shield" />,
    <Zap className="w-6 h-6" key="zap" />
  ];

  const displaySteps = (data?.steps && data.steps.length === 3) 
    ? data.steps.map((step, idx) => ({
        icon: stepIcons[idx] || <ShieldCheck className="w-6 h-6" />,
        title: step.title,
        description: step.description
      }))
    : steps;

  return (
    <section className="py-16 px-6 w-full max-w-7xl mx-auto">
      <div className="bg-slate-950 rounded-[3.5rem] p-8 md:p-20 text-white relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/5">
        {/* Background Decor - Refined Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-emerald/20 blur-[120px] rounded-full animate-pulse-subtle" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full animate-pulse-subtle" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-emerald/10 text-brand-emerald text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-brand-emerald/20 backdrop-blur-sm">
              <BadgeCheck className="w-4 h-4" /> {badge}
            </div>
            
            <h2 className="text-4xl md:text-6xl font-montserrat font-black leading-[1.1] mb-8 uppercase tracking-tighter">
              {title_part1} <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-yellow">{title_part2}</span>
            </h2>
            
            <p className="text-slate-400 text-base md:text-xl mb-10 leading-relaxed font-medium max-w-lg">
              {descriptionText}
            </p>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl transition-colors hover:bg-white/10"
            >
               <div className="w-14 h-14 bg-gradient-to-br from-brand-emerald to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl shadow-blue-500/20">
                 <ShieldCheck className="w-8 h-8 text-white" />
               </div>
               <div>
                 <p className="text-sm md:text-base font-black uppercase tracking-wider mb-1">{certified_title}</p>
                 <p className="text-xs text-slate-400 font-medium">{certified_desc}</p>
               </div>
            </motion.div>
          </div>

          <div className="grid gap-6">
            {displaySteps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ x: 10 }}
                className="group flex gap-6 p-8 glass-dark rounded-[2.5rem] border border-white/5 hover:border-brand-emerald/30 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-brand-emerald flex-shrink-0 group-hover:bg-brand-emerald group-hover:text-white transition-all shadow-inner">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-black text-lg md:text-xl mb-2 uppercase tracking-tight group-hover:text-brand-emerald transition-colors">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
