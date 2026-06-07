import Calculator from '@/components/Calculator';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import TrustSection from '@/components/TrustSection';
import Testimonials from '@/components/Testimonials';
import LeadForm from '@/components/LeadForm';
import Footer from '@/components/Footer';
import { getAllSiteSettingsAction } from '@/app/actions/settings';

export default async function CalculadoraPage() {
  const settingsRes = await getAllSiteSettingsAction();
  const settings = settingsRes.success ? settingsRes.data : null;
  
  // Encontrar a configuração específica para este serviço
  const service = (settings?.services || []).find((s: any) => s.id === 'limpeza_solar') || {
    title: 'Calcule sua Economia',
    description: 'Descubra quanto você está deixando de ganhar por causa da sujeira nos seus painéis solares.'
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
           <h1 className="text-3xl md:text-5xl font-montserrat font-black text-brand-navy dark:text-slate-100 uppercase tracking-tight">
             {service.title}
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-md mx-auto font-medium">
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

        <Calculator />
        
        <div className="mt-8 text-center text-[10px] text-slate-400 max-w-xs mx-auto">
          *Cálculo baseado em perda média de 15% de eficiência em sistemas com sujeira acumulada.
        </div>
      </section>

      <TrustSection data={settings?.trust} />
      <Testimonials serviceId="limpeza_solar" data={testimonialsData} />
      <LeadForm defaultService="Limpeza Técnica de Placas" />
      <Footer />
    </main>
  );
}
