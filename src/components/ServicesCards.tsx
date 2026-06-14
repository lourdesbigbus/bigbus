"use client";

import React from 'react';
import Link from 'next/link';
import { servicesConfig } from '@/config/services';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronRight } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const item = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface ServiceItem {
  id: string;
  title: string;
  image: string;
  icon: string;
  href: string;
}

interface ServicesCardsProps {
  data?: ServiceItem[];
}

export default function ServicesCards({ data }: ServicesCardsProps) {
  let services = servicesConfig;
  if (data && Array.isArray(data)) {
    const merged = [...data];
    servicesConfig.forEach(defS => {
      if (!merged.some(s => s.id === defS.id)) {
        merged.push(defS);
      }
    });
    services = merged;
  }

  const activeServices = services.filter(s => !(s as any).hidden);

  return (
    <section className="w-full relative z-10">
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="flex flex-col gap-6"
      >
        <div className="mb-2">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-navy dark:text-slate-400 opacity-60 mb-1">
            Categorias de Veículos
          </h2>
          <div className="w-12 h-1 bg-brand-emerald rounded-full" />
        </div>

        {activeServices.map((service, index) => (
          <motion.div 
            variants={item}
            key={service.id} 
            whileHover={{ x: 10 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-brand-emerald/5 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative glass dark:glass-dark rounded-[2rem] overflow-hidden p-5 flex items-center gap-6 border border-white/40 dark:border-slate-700/30 transition-all duration-300 group-hover:border-brand-emerald/30 group-hover:shadow-2xl group-hover:shadow-brand-emerald/10">
              {/* Image Container */}
              <div className="w-24 h-24 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-emerald/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-contain relative z-10"
                />
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-2">
                   <div className="bg-brand-emerald/10 text-brand-emerald text-[8px] font-black px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                     <ShieldCheck className="w-2.5 h-2.5" /> VISTORIADO
                   </div>
                </div>
                
                <h3 className="font-montserrat font-black text-xs md:text-sm text-brand-navy dark:text-slate-100 uppercase leading-tight tracking-wider mb-4">
                  {service.title}
                </h3>

                <Link href={service.href || '#'} className="inline-flex">
                  <button className="relative group/btn bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black py-2.5 px-5 rounded-xl transition-all hover:pr-8 active:scale-95 uppercase tracking-widest flex items-center gap-2 overflow-hidden">
                    <span className="relative z-10">
                      {service.id === 'vans' ? 'Simular Vans' : 
                       service.id === 'onibus' ? 'Simular Ônibus' : 
                       service.id === 'carros' ? 'Simular Carros' : 
                       service.id === 'motorhomes' ? 'Simular Motorhome' : 'Negociar'}
                    </span>
                    <ChevronRight className="w-3 h-3 absolute right-3 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                  </button>
                </Link>
              </div>

              {/* Shine Effect Overlay */}
              <div className="absolute inset-0 pointer-events-none group-hover:animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
