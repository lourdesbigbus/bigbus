import Hero from '@/components/Hero';
import TrustSection from '@/components/TrustSection';
import ServicesCards from '@/components/ServicesCards';
import InteractiveHouse from '@/components/InteractiveHouse';
import GaleriaSection from '@/components/GaleriaSection';
import LeadForm from '@/components/LeadForm';
import Footer from '@/components/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getAllSiteSettingsAction } from '@/app/actions/settings';

export default async function Home() {
  const settingsRes = await getAllSiteSettingsAction();
  const settings = settingsRes.success ? settingsRes.data : null;

  return (
    <main className="flex-1 flex flex-col items-center w-full overflow-x-hidden relative">
      {/* Background Decor - Refined organic blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-emerald/15 dark:bg-brand-emerald/5 blur-[140px] animate-pulse-subtle" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[140px] animate-pulse-subtle" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-orange-500/5 dark:bg-orange-500/5 blur-[100px]" />
      </div>
      
      <header className="absolute top-0 w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-brand-emerald to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 transition-transform group-hover:scale-110">
            <span className="text-white font-black text-2xl">H</span>
          </div>
          <div className="flex flex-col -gap-1">
            <span className="font-montserrat font-black text-brand-navy dark:text-white text-xl md:text-2xl tracking-tighter uppercase">Hubly Pro</span>
            <span className="text-[10px] text-brand-emerald font-bold tracking-[0.2em] uppercase opacity-80">Premium Services</span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero & Services Section - Sidebar Layout */}
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-start justify-between pt-32 pb-20 px-6 md:px-12 gap-16 lg:gap-20">
        <div className="w-full lg:w-[55%] sticky top-32">
          <Hero data={settings?.hero} />
        </div>
        <div className="w-full lg:w-[40%] xl:w-[35%]">
          <ServicesCards data={settings?.services} />
        </div>
      </div>

      <InteractiveHouse />

      <div className="w-full bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border-y border-slate-200/50 dark:border-slate-800/50">
        <TrustSection data={settings?.trust} />
      </div>
      
      <GaleriaSection />
      <LeadForm />
      <Footer />
    </main>
  );
}
