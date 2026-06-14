import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-8 px-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-500 dark:text-slate-400 text-sm">
          © {new Date().getFullYear()} BigBus. Todos os direitos reservados.
        </div>
        
        <Link 
          href="/admin" 
          className="flex items-center gap-2 text-slate-400 hover:text-brand-emerald dark:text-slate-500 dark:hover:text-brand-emerald transition-colors text-xs font-medium uppercase tracking-widest"
        >
          <Lock className="w-3 h-3" />
          Acesso Restrito (CRM)
        </Link>
      </div>
    </footer>
  );
}
