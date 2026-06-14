"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Quote, ShieldCheck, Star } from 'lucide-react';
import Counter from './Counter';

interface Testimonial {
  id: number;
  text: string;
  service: string;
  serviceId: string;
  name: string;
  location: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "Realizei o sonho de comprar meu motorhome com a BigBus. O processo de financiamento foi super rápido e a vistoria cautelar me deu total segurança. Veículo entregue impecável!",
    service: "Motorhomes e RVs",
    serviceId: "motorhomes",
    name: "Carlos Eduardo",
    location: "Florianópolis, SC",
    rating: 5
  },
  {
    id: 2,
    text: "Vendi minha van de passageiros em tempo recorde. Eles intermediaram tudo, desde a avaliação até a transferência. Dinheiro rápido e zero burocracia!",
    service: "Vans e Utilitários",
    serviceId: "vans",
    name: "Mariana Souza",
    location: "Joinville, SC",
    rating: 5
  },
  {
    id: 3,
    text: "Comprei um SUV e dei meu carro antigo na troca. Excelente avaliação do meu usado e taxas de juros bem menores do que o banco estava me oferecendo. Nota 10!",
    service: "Carros e SUVs",
    serviceId: "carros",
    name: "Roberto Almeida",
    location: "Blumenau, SC",
    rating: 5
  },
  {
    id: 4,
    text: "Adquiri dois micro-ônibus para a minha frota de turismo. A BigBus comprovou procedência e revisou toda a parte mecânica. Parceiros de confiança!",
    service: "Ônibus e Micro-ônibus",
    serviceId: "onibus",
    name: "Ricardo Mendes",
    location: "São José, SC",
    rating: 5
  }
];

interface TestimonialsProps {
  serviceId?: string;
  data?: Testimonial[];
}

export default function Testimonials({ serviceId, data }: TestimonialsProps) {
  const allTestimonials = data || testimonials;
  
  // Filtra depoimentos se o serviceId for passado, caso contrário mostra uma seleção mista
  const filteredTestimonials = serviceId 
    ? allTestimonials.filter(t => t.serviceId === serviceId)
    : allTestimonials.filter(t => [1, 2, 3].includes(t.id) || allTestimonials.indexOf(t) < 3); // Mostra os 3 principais na home

  return (
    <section className="py-16 px-6 w-full max-w-7xl mx-auto z-10 relative">
      <div className="text-center mb-12">

        <h2 className="text-3xl md:text-5xl font-montserrat font-black text-brand-navy dark:text-slate-100 mb-6 uppercase tracking-tighter leading-tight">
          O QUE NOSSOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-emerald-400">CLIENTES</span> DIZEM
        </h2>
        <div className="w-24 h-1.5 bg-brand-orange mx-auto rounded-full mb-6" />
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-xl font-medium max-w-2xl mx-auto">
          {serviceId 
            ? `Veja a experiência de quem já contratou nosso serviço de ${allTestimonials.find(t => t.serviceId === serviceId)?.service || 'nossos parceiros'}.`
            : <span>São mais de <Counter target={250} /> clientes e empresas atendidos com excelência em Santa Catarina.</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        {filteredTestimonials.map((testimonial, index) => (
          <motion.div 
            key={testimonial.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            whileHover={{ y: -10 }}
            className="group flex flex-col h-full relative glass dark:glass-dark rounded-[2.5rem] p-8 md:p-10 border border-white/40 dark:border-slate-800/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-brand-emerald/10"
          >
            {/* Quote Icon */}
            <div className="absolute -top-6 -left-4 w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/30 group-hover:scale-110 transition-transform">
              <Quote className="w-6 h-6 fill-current" />
            </div>
            
            <div className="flex-1 mb-8 pt-4">
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={`w-4 h-4 ${s <= testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} 
                  />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic text-base md:text-lg leading-relaxed font-medium">
                "{testimonial.text}"
              </p>
            </div>
            
            <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-2 border-white dark:border-slate-700 flex items-center justify-center text-brand-emerald font-black text-xl overflow-hidden shadow-inner">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-brand-navy dark:text-slate-100 uppercase tracking-tight">
                    {testimonial.name}
                  </p>
                  <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-tight">
                    {testimonial.location}
                  </p>
                </div>
              </div>
              {!serviceId && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-emerald/10 text-brand-emerald text-[9px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> {testimonial.service}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
