"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WhatsAppFloatingButtonProps {
  number?: string;
}

export default function WhatsAppFloatingButton({ number = '5548999999999' }: WhatsAppFloatingButtonProps) {
  const [msg, setMsg] = useState('Olá! Gostaria de solicitar um orçamento.');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('automacao-residencial')) {
        setMsg('Olá! Gostaria de solicitar um orçamento para o serviço de Automação Residencial.');
      } else if (path.includes('ar-condicionado')) {
        setMsg('Olá! Gostaria de solicitar um orçamento para o serviço de Ar Condicionado.');
      } else if (path.includes('controle-acesso')) {
        setMsg('Olá! Gostaria de solicitar um orçamento para o serviço de Controle de Acesso.');
      } else if (path.includes('aquecimento')) {
        setMsg('Olá! Gostaria de solicitar um orçamento para o serviço de Aquecimento de Piso.');
      } else if (path.includes('instalacao')) {
        setMsg('Olá! Gostaria de solicitar um orçamento para o serviço de Instalação e Manutenção Solar.');
      } else if (path.includes('calculadora')) {
        setMsg('Olá! Gostaria de fazer uma simulação de economia de energia solar.');
      } else {
        setMsg('Olá! Gostaria de solicitar um orçamento.');
      }
    }

    // Mostrar tooltip por alguns segundos depois de carregar a página
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleClick = () => {
    const formattedNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="hidden sm:block bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider py-3 px-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 cursor-pointer"
            onClick={handleClick}
          >
            Fale Conosco no WhatsApp
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-r border-t border-slate-100 dark:border-slate-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.6)] transition-all cursor-pointer group"
        aria-label="Fale conosco no WhatsApp"
      >
        {/* Pulsing Outer Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping -z-10" />

        {/* WhatsApp Official SVG Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="w-8 h-8 fill-current transition-transform group-hover:rotate-12 duration-300"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
      </motion.button>
    </div>
  );
}
