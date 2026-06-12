"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Zap, ThermometerSun, ShieldCheck, CheckCircle2, FileSpreadsheet, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ServiceDetail {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  badge: string;
  buttonText: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  coords: { x: number; y: number };
}

const servicesData: ServiceDetail[] = [
  {
    id: 0,
    title: "Energia Solar Residencial",
    subtitle: "Geração própria de energia limpa e renovável.",
    description: "Economize até 95% na sua fatura de energia elétrica e proteja-se contra a inflação energética. A Hubly Pro cuida de toda a viabilidade técnica, projeto de engenharia e homologação na concessionária.",
    benefits: [
      "Economia imediata de até 95% na conta",
      "Retorno de investimento (Payback) rápido",
      "Valorização instantânea de mercado do imóvel",
      "Equipamentos premium com até 25 anos de garantia"
    ],
    badge: "Energia Inteligente",
    buttonText: "Simular Projeto Solar",
    href: "/instalacao",
    icon: Sun,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    coords: { x: 42, y: 24 }
  },
  {
    id: 1,
    title: "Carregamento Veicular (EV)",
    subtitle: "Infraestrutura moderna e segura para recarga em casa.",
    description: "Carregue o seu veículo elétrico no conforto do seu lar utilizando a energia gerada pelo sol. Projetos completos com carregadores de carga rápida (Wallbox), proteções obrigatórias (DPS e DR) e estudo de capacidade da rede.",
    benefits: [
      "Custo de recarga até 80% menor que gasolina",
      "Estação de carregamento inteligente e rápida (Wallbox)",
      "Dispositivos de proteção elétrica inclusos (DPS/DR)",
      "Integração perfeita com o sistema solar da casa"
    ],
    badge: "Mobilidade Elétrica",
    buttonText: "Orçamento de Carregador",
    href: "/carregamento-veicular",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    coords: { x: 27, y: 68 }
  },
  {
    id: 2,
    title: "Aquecimento de Piso Premium",
    subtitle: "O máximo conforto térmico inteligente para o seu lar.",
    description: "Esqueça o frio nos pés com o aquecimento sob o piso. Um sistema totalmente silencioso, invisível e energeticamente eficiente, controlado por termostatos inteligentes wifi com controle independente de zonas.",
    benefits: [
      "Temperatura uniforme e agradável por toda a casa",
      "Controle inteligente por aplicativo no celular/Wi-Fi",
      "Livre de poeira e ácaros (ideal para pessoas alérgicas)",
      "Instalação compatível com porcelanato, vinílico e madeira"
    ],
    badge: "Conforto Térmico",
    buttonText: "Simular Aquecimento de Piso",
    href: "/aquecimento",
    icon: ThermometerSun,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    coords: { x: 58, y: 82 }
  },
  {
    id: 3,
    title: "Limpeza Técnica de Placas",
    subtitle: "Manutenção automatizada com robôs para máxima performance.",
    description: "A sujeira acumulada nas suas placas solares pode reduzir a sua geração em até 30%. Realizamos limpeza técnica especializada com água desmineralizada e robôs automáticos de última geração, sem riscos aos módulos.",
    benefits: [
      "Recuperação imediata da eficiência de geração solar",
      "Limpeza automatizada segura sem riscos de trincas nos vidros",
      "Prolongamento da vida útil e proteção das placas",
      "Equipe técnica certificada pelas normas NR35 e NR10"
    ],
    badge: "Alta Performance",
    buttonText: "Calcular Perda por Sujeira",
    href: "/calculadora",
    icon: ShieldCheck,
    color: "text-[#DC2626]",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    coords: { x: 64, y: 24 }
  }
];

export default function InteractiveHouse() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const activeService = servicesData[activeTab];
  const ActiveIcon = activeService.icon;

  return (
    <section className="w-full py-20 bg-slate-50 dark:bg-slate-950 border-y border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Title and Intro */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-bold uppercase tracking-widest mb-4 border border-brand-emerald/20">
            Hubly Smart Home
          </span>
          <h2 className="text-3xl md:text-4xl font-montserrat font-black text-brand-navy dark:text-slate-100 uppercase tracking-tighter leading-tight">
            UMA ÚNICA ENERGIA. <span className="text-brand-emerald">MÚLTIPLAS SOLUÇÕES.</span>
          </h2>
          <div className="w-16 h-1 bg-brand-emerald mx-auto rounded-full mt-4 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base leading-relaxed">
            Conectamos tecnologia, conforto e sustentabilidade para gerar economia imediata e valorizar o seu imóvel. Toque nos pontos da casa ou navegue pelos serviços para ver como funciona.
          </p>
        </div>

        {/* Interactive Interactive Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          
          {/* List/Details panel (Left - 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* Tabs List */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
              {servicesData.map((service) => {
                const TabIcon = service.icon;
                const isActive = activeTab === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => setActiveTab(service.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 shadow-md border-slate-200 dark:border-slate-800 scale-[1.02]'
                        : 'bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-slate-900/40 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? service.bgColor : 'bg-slate-100 dark:bg-slate-900'}`}>
                      <TabIcon className={`w-4.5 h-4.5 ${isActive ? service.color : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black uppercase tracking-tight truncate ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 font-semibold'}`}>
                        {service.id + 1}. {service.title.split(' (')[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-medium">
                        {service.badge}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tab Details Box */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex-1 flex flex-col justify-between mt-4 lg:mt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div>
                    <span className={`inline-block text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${activeService.bgColor} ${activeService.color} border ${activeService.borderColor}`}>
                      {activeService.badge}
                    </span>
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white uppercase tracking-tight mt-2.5">
                      {activeService.title}
                    </h3>
                    <p className="text-xs text-brand-emerald dark:text-emerald-400 font-bold mt-1">
                      {activeService.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {activeService.description}
                  </p>

                  <div className="space-y-2.5">
                    {activeService.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <CheckCircle2 className={`w-4 h-4 ${activeService.color} flex-shrink-0 mt-0.5`} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={activeService.href}
                  className={`w-full group relative overflow-hidden bg-brand-navy hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-brand-navy font-black py-3 px-5 rounded-2xl shadow-sm transition-all active:scale-[0.98] uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 cursor-pointer`}
                >
                  <span>{activeService.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

          </div>

          {/* Interactive House Diagram (Right - 7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm flex items-center justify-center relative overflow-hidden aspect-square lg:aspect-auto min-h-[400px] lg:min-h-0">
            {/* Visual background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            
            {/* Main House Image */}
            <div className="relative w-full h-full max-w-[550px] aspect-square flex items-center justify-center">
              <img
                src="/images/hubly_house_diagram.png"
                alt="Diagrama Casa Eficiente Hubly"
                className="w-full h-full object-contain select-none"
              />

              {/* Glowing Hotspots */}
              {servicesData.map((service) => {
                const isActive = activeTab === service.id;
                const SpotIcon = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={() => setActiveTab(service.id)}
                    className="absolute cursor-pointer group z-20 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${service.coords.x}%`, top: `${service.coords.y}%` }}
                  >
                    {/* Ring Animations */}
                    <div className="relative flex items-center justify-center">
                      <span className={`absolute inline-flex h-9 w-9 rounded-full opacity-60 animate-ping ${isActive ? service.bgColor : 'bg-slate-500/10'}`} />
                      <span className={`absolute inline-flex h-6 w-6 rounded-full opacity-40 animate-pulse ${isActive ? service.bgColor : 'bg-slate-500/20'}`} />
                      
                      {/* Main Center circle */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all shadow-md ${
                        isActive 
                          ? `${service.bgColor} border-white dark:border-slate-900 scale-110` 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:scale-105'
                      }`}>
                        <SpotIcon className={`w-3.5 h-3.5 ${isActive ? service.color : 'text-slate-400 group-hover:text-slate-600'}`} />
                      </div>
                      
                      {/* Label tooltip (Desktop hover or active state) */}
                      <span className={`absolute top-full mt-2 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-md shadow-lg pointer-events-none transition-all duration-200 border border-slate-800 ${
                        isActive 
                          ? 'opacity-100 scale-100 visible' 
                          : 'opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible'
                      }`}>
                        {service.title.split(' (')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Benefits/Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-slate-200/60 dark:border-slate-800/60">
          
          <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Economia Real</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Reduza gastos com concessionárias de energia fóssil e converta a economia em lucro líquido desde o primeiro mês.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Sun className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Sustentabilidade</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Gere sua própria energia com zero emissões, contribuindo para um planeta ecologicamente limpo e sustentável.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
              <ThermometerSun className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Conforto Total</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Equipamentos de alto padrão que garantem aconchego térmico, automação avançada e bem-estar para toda a família.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#DC2626]/10 flex items-center justify-center text-[#DC2626]">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Valorização do Imóvel</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Tecnologias sustentáveis integradas valorizam o valor patrimonial da residência em até 10% a mais no mercado.
            </p>
          </div>

        </div>

        {/* Credentials Badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center mt-12 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Projeto Personalizado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Equipamentos Premium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Instalação Segura e Certificada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Suporte Técnico Especializado</span>
          </div>
        </div>

      </div>
    </section>
  );
}
