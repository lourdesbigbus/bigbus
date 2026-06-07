import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Fingerprint, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import TrustSection from '@/components/TrustSection';
import Testimonials from '@/components/Testimonials';
import LeadForm from '@/components/LeadForm';
import Footer from '@/components/Footer';
import { getAllSiteSettingsAction } from '@/app/actions/settings';

export default async function ControleAcessoPage() {
  const settingsRes = await getAllSiteSettingsAction();
  const settings = settingsRes.success ? settingsRes.data : null;
  
  // Encontrar a configuração específica para este serviço
  const service = (settings?.services || []).find((s: any) => s.id === 'controle_acesso') || {
    title: 'Controle de Acesso',
    description: 'Sistemas inteligentes de identificação, biometria e controle de fluxo para condomínios e empresas.',
    subpage_image: '/images/controle_acesso.png',
    differentials_title: 'Diferenciais do Serviço:',
    differentials: [
      "Reconhecimento facial e biometria de última geração",
      "Integração com sistemas de segurança e portaria",
      "Controle de fluxo de pedestres e veículos por aplicativo",
      "Suporte técnico 24h e manutenção preventiva"
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

      {/* Hero Service */}
      <section className="w-full pt-32 pb-0 px-4 flex flex-col items-center">
        <div className="w-full max-w-6xl mb-8 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-emerald transition-colors font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Home
          </Link>
        </div>

        <div className="max-w-4xl text-center mb-0">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-bold uppercase tracking-widest mb-6 border border-brand-emerald/20 shadow-sm">
             <ShieldCheck className="w-4 h-4" /> Serviço Homologado Hubly Pro
           </div>
           <h1 className="text-4xl md:text-6xl font-montserrat font-black text-brand-navy dark:text-slate-100 uppercase tracking-tight leading-[1.1]">
             {service.title}
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-6 text-lg max-w-2xl mx-auto">
             {service.description}
           </p>
           <div className="mt-8 flex justify-center">
             <a
               href="#lead-form"
               className="group relative bg-brand-orange hover:bg-orange-400 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2 overflow-hidden cursor-pointer"
             >
               <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
               Fazer Orçamento
               <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
             </a>
           </div>
         </div>
      </section>

      <TrustSection data={settings?.trust} />
      
      <div className="py-12 w-full bg-white/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white dark:border-slate-700">
             <img src={service.subpage_image || service.image || "/images/controle_acesso.png"} alt={service.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />
             <div className="absolute bottom-6 left-6 text-white">
                <Fingerprint className="w-8 h-8 text-brand-emerald mb-2" />
                <p className="font-bold text-xl uppercase tracking-tighter">Segurança Inteligente</p>
             </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-brand-navy dark:text-white uppercase tracking-tight">
              {service.differentials_title || 'Diferenciais do Serviço:'}
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

      <Testimonials serviceId="controle_acesso" data={testimonialsData} />
      <LeadForm defaultService={service.title} />
      <Footer />
    </main>
  );
}
