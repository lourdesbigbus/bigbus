"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart, 
  LogOut, 
  Search, 
  Bell,
  Menu,
  ChevronRight,
  Sun,
  Images
} from 'lucide-react';

function SidebarNav() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';

  return (
    <nav className="flex-1 px-3 space-y-1">
      <Link 
        href="/admin?tab=dashboard" 
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-all ${
          tab === 'dashboard'
          ? 'bg-brand-emerald text-white shadow-md shadow-emerald-500/10' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" /> Dashboard
      </Link>
      <Link 
        href="/admin?tab=leads" 
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-all ${
          tab === 'leads' 
          ? 'bg-brand-emerald text-white shadow-md shadow-emerald-500/10' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Users className="w-4 h-4" /> Leads
      </Link>
      <Link 
        href="/admin?tab=projetos-solares" 
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-all ${
          tab === 'projetos-solares' 
          ? 'bg-brand-emerald text-white shadow-md shadow-emerald-500/10' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Sun className="w-4 h-4" /> Projetos Solares
      </Link>
      <Link 
        href="/admin?tab=galeria" 
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-all ${
          tab === 'galeria' 
          ? 'bg-brand-emerald text-white shadow-md shadow-emerald-500/10' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Images className="w-4 h-4" /> Galeria &amp; Depoimentos
      </Link>
      <Link 
        href="/admin?tab=relatorios" 
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-all ${
          tab === 'relatorios' 
          ? 'bg-brand-emerald text-white shadow-md shadow-emerald-500/10' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <BarChart className="w-4 h-4" /> Relatórios
      </Link>
      <Link 
        href="/admin?tab=editar-site" 
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-all ${
          tab === 'editar-site' 
          ? 'bg-brand-emerald text-white shadow-md shadow-emerald-500/10' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Settings className="w-4 h-4" /> Editar Site
      </Link>
    </nav>
  );
}

function SidebarFooterNav({ handleLogout }: { handleLogout: () => void }) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';

  return (
    <nav className="space-y-1">
      <Link 
        href="/admin?tab=configuracoes" 
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-all ${
          tab === 'configuracoes'
          ? 'bg-brand-emerald text-white shadow-md shadow-emerald-500/10' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Settings className="w-4 h-4" /> Configurações
      </Link>
      <button 
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-md font-medium text-sm transition-all cursor-pointer"
      >
        <LogOut className="w-4 h-4" /> Sair do Sistema
      </button>
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth', { method: 'DELETE' });
      if (res.ok) {
        window.location.href = '/admin/login';
      }
    } catch (err) {
      console.error('Erro ao sair do sistema:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-inter text-slate-900">
      {/* Sidebar - Estilo Bling/Tiny */}
      <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col hidden lg:flex fixed h-full z-20">
        <div className="p-6 flex items-center gap-3 bg-[#1e293b]/50">
          <div className="w-8 h-8 bg-brand-emerald rounded flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="font-montserrat font-bold text-white text-lg tracking-tight">Hubly Pro</span>
        </div>

        <div className="px-4 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Menu Principal
        </div>

        <Suspense fallback={<div className="px-6 py-4 text-xs text-slate-500">Carregando menu...</div>}>
          <SidebarNav />
        </Suspense>

        <div className="p-4 bg-[#1e293b]/30 border-t border-slate-800/50 mt-auto">
          <Suspense fallback={<div className="px-6 py-2 text-xs text-slate-500">...</div>}>
            <SidebarFooterNav handleLogout={handleLogout} />
          </Suspense>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar ERP Style */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 text-slate-400">
            <button className="lg:hidden p-2 hover:bg-slate-100 rounded-md">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="hidden md:flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
              <span>Admin</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-900">Dashboard</span>
            </div>
            
            <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 ml-4">
              <Search className="w-4 h-4 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar lead ou serviço..." 
                className="bg-transparent border-none text-xs outline-none w-48 text-slate-600 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button className="p-2 text-slate-400 hover:text-brand-emerald relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-[1px] bg-slate-200"></div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-900">Hubly Pro</p>
                <p className="text-[10px] text-slate-500">Plano Pro</p>
              </div>
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
