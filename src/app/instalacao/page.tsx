import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, BadgeCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import TrustSection from '@/components/TrustSection';
import Testimonials from '@/components/Testimonials';
import LeadForm from '@/components/LeadForm';
import Footer from '@/components/Footer';
import SolarCalculatorPortal from '@/components/SolarCalculatorPortal';
import { getAllSiteSettingsAction } from '@/app/actions/settings';

export default async function InstalacaoPage() {
  const settingsRes = await getAllSiteSettingsAction();
  const settings = settingsRes.success ? settingsRes.data : null;
  
  // Encontrar a configuração específica para este serviço
  const service = (settings?.services || []).find((s: any) => s.id === 'instalacao_manutencao') || {
    title: 'Instalação e Manutenção',
    description: 'Projetos de energia solar de alta performance, desde a homologação até o monitoramento ativo.',
    subpage_image: '/images/instalacao.png',
    differentials_title: 'O que garantimos:',
    differentials: [
      "Projetos assinados por Engenheiros Homologados",
      "Uso de materiais de primeira linha (Tier 1)",
      "Pós-venda e monitoramento ativo pela Hubly Pro",
      "Instalação rápida e com limpeza total"
    ]
  };

  const testimonialsData = settings?.testimonials || [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-emerald/10 dark:bg-brand-emerald/5 blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[120px]" />
      </div>

      <header className="absolute top-0 w-full px-4 py-4 md:px-8 md:py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-emerald rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-black text-xl">H</span>
          </div>
          <span className="font-montserrat font-black text-brand-navy dark:text-white text-xl tracking-tight">Hubly Pro</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section with Calculator */}
      <section className="w-full pt-20 pb-12 overflow-hidden relative">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 -z-20">
          <img 
            src={service.subpage_image || service.image || "/images/instalacao.png"} 
            alt="Fundo Instalação" 
            className="w-full h-full object-cover opacity-20 dark:opacity-10 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-transparent to-slate-50 dark:from-slate-950 dark:via-transparent dark:to-slate-950" />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30 dark:opacity-20 blur-[120px] pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-emerald rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-orange rounded-full" />
        </div>
        
        <div className="w-full max-w-7xl mx-auto px-4 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-emerald transition-colors font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Home
          </Link>
        </div>

        <SolarCalculatorPortal />
      </section>

      <TrustSection data={settings?.trust} />
      
      <div className="py-12 w-full bg-white/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white dark:border-slate-700">
             <img src={service.subpage_image || service.image || "/images/instalacao.png"} alt={service.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />
             <div className="absolute bottom-6 left-6 text-white">
                <BadgeCheck className="w-8 h-8 text-brand-emerald mb-2" />
                <p className="font-bold text-xl uppercase tracking-tighter">Engenharia Certificada</p>
             </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-brand-navy dark:text-white uppercase tracking-tight font-montserrat">
              {service.differentials_title || 'O que garantimos:'}
            </h3>
            <ul className="space-y-3">
              {(service.differentials || []).map((item: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm md:text-base">
                  <div className="w-5 h-5 rounded-full bg-brand-emerald/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-brand-emerald" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Testimonials serviceId="instalacao_manutencao" data={testimonialsData} />
      <LeadForm defaultService="Instalação e Manutenção" />
      <Footer />
    </main>
  );
}
