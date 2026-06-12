"use client";

import React from 'react';
import { Lead } from '@/types';
import { Sun, MapPin, ChevronLeft, ChevronRight, Settings, Phone, Calendar, ClipboardCheck } from 'lucide-react';

interface AdminSolarProjectsProps {
  leads: Lead[];
  onSaveLeadDetails: (lead: Lead) => void;
  onOpenLeadDetails: (lead: Lead) => void;
}

const SOLAR_STAGES = [
  { key: 'Dimensionamento', label: '1. Dimensionamento', desc: 'Estudo de consumo e viabilidade', border: 'border-t-orange-500', bg: 'bg-orange-50/50' },
  { key: 'Projeto', label: '2. Elaboração do Projeto', desc: 'Engenharia de diagramas elétricos', border: 'border-t-blue-500', bg: 'bg-blue-50/50' },
  { key: 'Homologação', label: '3. Homologação (Filing)', desc: 'Documentos na concessionária', border: 'border-t-purple-500', bg: 'bg-purple-50/50' },
  { key: 'Logística', label: '4. Logística de Materiais', desc: 'Envio de painéis e inversor', border: 'border-t-pink-500', bg: 'bg-pink-50/50' },
  { key: 'Instalação', label: '5. Instalação Física', desc: 'Montagem mecânica e elétrica', border: 'border-t-yellow-500', bg: 'bg-yellow-50/50' },
  { key: 'Vistoria', label: '6. Vistoria Concessionária', desc: 'Inspeção física local da rede', border: 'border-t-teal-500', bg: 'bg-teal-50/50' },
  { key: 'Medidor', label: '7. Troca do Medidor', desc: 'Instalação do relógio bidirecional', border: 'border-t-indigo-500', bg: 'bg-indigo-50/50' },
  { key: 'Ativado', label: '8. Sistema Ativado', desc: 'Geração solar ativa injetando na rede', border: 'border-t-emerald-500', bg: 'bg-emerald-50/50' }
];

export default function AdminSolarProjects({ leads, onSaveLeadDetails, onOpenLeadDetails }: AdminSolarProjectsProps) {
  // Filtrar apenas leads que são do serviço de Energia Solar
  const solarLeads = leads.filter(l => l.servico === 'Energia Solar');

  const getLeadStage = (lead: Lead) => {
    return lead.projeto_solar_etapa || 'Dimensionamento';
  };

  const moveLeadStage = (lead: Lead, direction: 'forward' | 'backward') => {
    const currentStage = getLeadStage(lead);
    const currentIndex = SOLAR_STAGES.findIndex(s => s.key === currentStage);
    
    let nextIndex = currentIndex;
    if (direction === 'forward' && currentIndex < SOLAR_STAGES.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === 'backward' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex !== currentIndex) {
      const updatedLead: Lead = {
        ...lead,
        projeto_solar_etapa: SOLAR_STAGES[nextIndex].key
      };
      onSaveLeadDetails(updatedLead);
    }
  };

  const getTempBorder = (temp?: string) => {
    switch (temp) {
      case 'Quente': return 'border-l-4 border-l-red-500';
      case 'Frio': return 'border-l-4 border-l-sky-400';
      case 'Morno':
      default: return 'border-l-4 border-l-amber-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* KPI bar specifically for solar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Projetos Solares Ativos</span>
          <span className="text-xl font-black text-slate-800">{solarLeads.filter(l => getLeadStage(l) !== 'Ativado').length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Capacidade Total Instalada</span>
          <span className="text-xl font-black text-brand-emerald">
            {solarLeads.reduce((acc, l) => acc + (l.solar_kwp || 0), 0).toFixed(1)} kWp
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Em Homologação/Vistoria</span>
          <span className="text-xl font-black text-purple-500">
            {solarLeads.filter(l => ['Homologação', 'Vistoria'].includes(getLeadStage(l))).length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Sistemas Conectados (Ativados)</span>
          <span className="text-xl font-black text-emerald-600">
            {solarLeads.filter(l => getLeadStage(l) === 'Ativado').length}
          </span>
        </div>
      </div>

      {/* Horizontal Pipeline Board */}
      <div className="w-full overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-[2240px]">
          {SOLAR_STAGES.map((stage, stageIdx) => {
            const stageLeads = solarLeads.filter(l => getLeadStage(l) === stage.key);
            
            return (
              <div 
                key={stage.key} 
                className={`w-72 flex-shrink-0 bg-slate-100/60 dark:bg-slate-900/10 rounded-xl p-3 border-t-4 ${stage.border} border-x border-b border-slate-200 dark:border-slate-800/80 flex flex-col min-h-[500px]`}
              >
                {/* Stage Header */}
                <div className="mb-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight truncate max-w-[80%]">
                      {stage.label}
                    </h3>
                    <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                      {stageLeads.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 truncate leading-tight">
                    {stage.desc}
                  </p>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="h-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-600 italic">
                      Nenhum projeto
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div 
                        key={lead.id} 
                        onClick={() => onOpenLeadDetails(lead)}
                        className={`bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/85 dark:border-slate-800/85 hover:border-brand-emerald hover:shadow-md cursor-pointer transition-all ${getTempBorder(lead.temperatura)}`}
                      >
                        {/* Name and State */}
                        <div className="flex justify-between items-start mb-1.5">
                          <p className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                            {lead.nome}
                          </p>
                          <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-200/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter`}>
                            {lead.status}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-2.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{lead.localizacao || 'Não informada'}</span>
                        </div>

                        {/* Solar specs */}
                        {(lead.solar_kwp || lead.solar_paineis) ? (
                          <div className="bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
                              <Sun className="w-3 h-3" />
                              {lead.solar_kwp ? `${lead.solar_kwp.toFixed(1)} kWp` : '—'}
                            </span>
                            <span className="text-slate-400">|</span>
                            <span>{lead.solar_paineis ? `${lead.solar_paineis} painéis` : '—'}</span>
                          </div>
                        ) : null}

                        {/* Protocol Info */}
                        {lead.solar_protocolo && (
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500 font-mono mb-2.5 leading-none">
                            <ClipboardCheck className="w-3 h-3 text-slate-400" />
                            <span className="truncate" title={lead.solar_protocolo}>Prot: {lead.solar_protocolo}</span>
                          </div>
                        )}

                        {/* Next Action / Contacts */}
                        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-2.5 mt-2">
                          <div className="text-left">
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Investimento</p>
                            <p className="font-mono text-[10px] font-black text-slate-700 dark:text-slate-300">
                              R$ {(lead.valor_fechado || lead.valor_proposta || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          
                          {/* Quick Navigation Controls */}
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              disabled={stageIdx === 0}
                              onClick={() => moveLeadStage(lead, 'backward')}
                              className={`p-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all ${
                                stageIdx === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                              title="Recuar etapa"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                              disabled={stageIdx === SOLAR_STAGES.length - 1}
                              onClick={() => moveLeadStage(lead, 'forward')}
                              className={`p-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all ${
                                stageIdx === SOLAR_STAGES.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                              title="Avançar etapa"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
