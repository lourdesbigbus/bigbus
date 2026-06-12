"use client";

import React, { useState } from 'react';
import { Leaf, Info, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EVCalculator() {
  const [mileage, setMileage] = useState(1500);
  const [consumption, setConsumption] = useState(10);
  const [gasPrice, setGasPrice] = useState(5.80);
  const [tariff, setTariff] = useState(0.85);

  // Calculations
  const gasCostMonthly = (mileage / consumption) * gasPrice;
  const evCostMonthly = (mileage / 6) * tariff; // 6 km/kWh is equal to 16.67 kWh/100km
  
  const evCostDisplay = Math.round(evCostMonthly);
  const gasCostDisplay = Math.round(gasCostMonthly);

  const monthlySavings = gasCostMonthly - evCostMonthly;
  const annualSavings = monthlySavings * 12;

  // CO2 reduction (120g per km, 18000km/year at 1500km/month gives 2.16 tons/year)
  const co2Savings = (mileage * 12 * 120) / 1000000;

  // Cost to run 100km
  const costPer100kmGas = (100 / consumption) * gasPrice;
  const costPer100kmEV = (100 / 6) * tariff;

  // Relative width calculation for comparison bars
  const maxCost = Math.max(gasCostMonthly, evCostMonthly, 1);
  const gasBarWidth = `${(gasCostMonthly / maxCost) * 100}%`;
  const evBarWidth = `${(evCostMonthly / maxCost) * 100}%`;

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16">
      {/* Title Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-montserrat font-black text-brand-navy dark:text-slate-100 uppercase tracking-tighter leading-tight">
          SIMULADOR DE ECONOMIA <span className="text-[#DC2626] dark:text-red-500">MOBILIDADE ELÉTRICA</span>
        </h2>
        <div className="w-16 h-1 bg-[#DC2626] mx-auto rounded-full mt-4 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Calcule a diferença financeira e o impacto ambiental de trocar o combustível fóssil pela eletricidade.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Sliders Card (Left - 7 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-8">
            {/* Mileage Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-2">🚗 Quilometragem Mensal</span>
                <span className="bg-red-50 text-[#DC2626] dark:bg-red-950/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-black">
                  {mileage.toLocaleString('pt-BR')} km
                </span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="5000" 
                step="100"
                value={mileage} 
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#DC2626] hover:accent-[#B91C1C] transition-all"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span>500 KM</span>
                <span>2.500 KM</span>
                <span>5.000 KM</span>
              </div>
            </div>

            {/* Consumption Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-2">⛽ Consumo Médio (Gasolina)</span>
                <span className="bg-red-50 text-[#DC2626] dark:bg-red-950/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-black">
                  {consumption} km/l
                </span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="20" 
                step="0.5"
                value={consumption} 
                onChange={(e) => setConsumption(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#DC2626] hover:accent-[#B91C1C] transition-all"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span>5 KM/L (SUV/V6)</span>
                <span>12 KM/L (MÉDIO)</span>
                <span>20 KM/L (HÍBRIDO)</span>
              </div>
            </div>

            {/* Gasoline Price Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-2">💵 Preço da Gasolina (por Litro)</span>
                <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-black">
                  R$ {gasPrice.toFixed(2)}
                </span>
              </div>
              <input 
                type="range" 
                min="4.50" 
                max="8.00" 
                step="0.05"
                value={gasPrice} 
                onChange={(e) => setGasPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-600 hover:accent-slate-700 transition-all"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span>R$ 4,50</span>
                <span>R$ 6,25</span>
                <span>R$ 8,00</span>
              </div>
            </div>

            {/* Energy Tariff Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-2">⚡ Tarifa de Energia (com Impostos)</span>
                <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-black">
                  R$ {tariff.toFixed(2)}/kWh
                </span>
              </div>
              <input 
                type="range" 
                min="0.50" 
                max="1.50" 
                step="0.05"
                value={tariff} 
                onChange={(e) => setTariff(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-600 hover:accent-slate-700 transition-all"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span>R$ 0,50 (BAIXA)</span>
                <span>R$ 1,00 (MÉDIA)</span>
                <span>R$ 1,50 (ALTA)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Panel (Right - 5 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 flex flex-col gap-6"
        >
          {/* Main Gradient Card */}
          <div className="bg-gradient-to-br from-[#B91C1C] via-[#334155] to-[#065F46] text-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-white/10 flex flex-col justify-between flex-1 relative overflow-hidden">
            {/* Visual shine overlay */}
            <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <span className="text-[10px] font-black tracking-[0.2em] opacity-80 uppercase block">
                Sua Economia Anual Estimada
              </span>
              <h3 className="text-4xl md:text-5xl font-montserrat font-black tracking-tight leading-none">
                {formatCurrency(annualSavings)}
              </h3>
              <p className="text-xs text-white/80 font-medium">
                Ou cerca de <strong className="text-white font-bold">{formatCurrency(monthlySavings)}</strong> economizados todos os meses.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-6 mt-8 relative z-10">
              {/* CO2 Reduction */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold tracking-wider text-white/60 uppercase block">Redução de CO₂</span>
                <div className="flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-black">{co2Savings.toFixed(1)} toneladas/ano</span>
                </div>
              </div>

              {/* Running Cost */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold tracking-wider text-white/60 uppercase block">Custo p/ rodar 100km</span>
                <span className="text-[11px] font-bold leading-tight block">
                  Gasolina: <strong className="text-red-400">R$ {Math.round(costPer100kmGas)}</strong>
                  <br />
                  Elétrico: <strong className="text-emerald-400">R$ {Math.round(costPer100kmEV)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Comparativo de Gasto Mensal Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-6">
            <div>
              <h4 className="text-[10px] font-black tracking-[0.15em] text-slate-400 dark:text-slate-500 uppercase">
                Comparativo de Gasto Mensal
              </h4>
            </div>

            <div className="space-y-4">
              {/* Combustion Row */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>Veículo Combustão</span>
                  <span className="text-slate-900 dark:text-white">R$ {gasCostDisplay}/mês</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800/50 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: gasBarWidth }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
              </div>

              {/* EV Row */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>Veículo Elétrico</span>
                  <span className="text-[#DC2626] dark:text-red-500 font-extrabold">R$ {evCostDisplay}/mês</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800/50 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: evBarWidth }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-[#DC2626] rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl flex gap-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              <Info className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
              <p>
                Cálculos considerando a tarifa média residencial padrão e consumo de 16,6 kWh/100km. A economia pode ser de até <strong className="text-slate-900 dark:text-white font-bold">100%</strong> se você possuir um sistema de Energia Solar fotovoltaica instalado.
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={scrollToForm}
              className="w-full relative overflow-hidden group bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black py-4.5 rounded-2xl shadow-lg shadow-red-500/10 transition-all active:scale-[0.98] uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" />
              <span>Solicitar Estudo de Viabilidade</span>
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
