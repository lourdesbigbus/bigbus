"use client";

import React, { useState, useMemo } from 'react';
import { Lead } from '@/types';
import { Sun, ChevronLeft, ChevronRight, X, Edit3, MessageCircle, Check, Search, Filter } from 'lucide-react';

interface AdminSolarProjectsProps {
  leads: Lead[];
  onSaveLeadDetails: (lead: Lead) => void;
  onOpenLeadDetails: (lead: Lead) => void;
}

const SOLAR_STAGES = [
  { key: 'Dimensionamento', label: '1. Dimensionamento',    color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { key: 'Projeto',         label: '2. Projeto Elétrico',   color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { key: 'Homologação',     label: '3. Homologação',        color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { key: 'Logística',       label: '4. Logística',          color: 'bg-pink-100 text-pink-700 border-pink-300' },
  { key: 'Instalação',      label: '5. Instalação Física',  color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { key: 'Vistoria',        label: '6. Vistoria',           color: 'bg-teal-100 text-teal-700 border-teal-300' },
  { key: 'Medidor',         label: '7. Troca do Medidor',   color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { key: 'Ativado',         label: '8. Ativado ✓',          color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
];

function getStageColor(key?: string) {
  const s = SOLAR_STAGES.find(s => s.key === (key || 'Dimensionamento'));
  return s ? s.color : 'bg-slate-100 text-slate-600 border-slate-300';
}

function getStageLabel(key?: string) {
  const s = SOLAR_STAGES.find(s => s.key === (key || 'Dimensionamento'));
  return s ? s.label : '1. Dimensionamento';
}

function getStageIndex(key?: string) {
  const idx = SOLAR_STAGES.findIndex(s => s.key === (key || 'Dimensionamento'));
  return idx >= 0 ? idx : 0;
}

export default function AdminSolarProjects({ leads, onSaveLeadDetails, onOpenLeadDetails }: AdminSolarProjectsProps) {
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('Todos');
  const [stageFilter, setStageFilter] = useState('Todos');

  // Serviços únicos para o dropdown
  const uniqueServices = useMemo(() => {
    const s = Array.from(new Set(leads.map(l => l.servico).filter(Boolean)));
    return s.sort();
  }, [leads]);

  // Leads filtrados (todos por padrão, sem restrição de serviço)
  const solarLeads = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = !searchTerm || 
        l.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.whatsapp.includes(searchTerm) ||
        (l.localizacao && l.localizacao.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchService = serviceFilter === 'Todos' || l.servico === serviceFilter;
      const matchStage = stageFilter === 'Todos' || (l.projeto_solar_etapa || 'Dimensionamento') === stageFilter;
      return matchSearch && matchService && matchStage;
    });
  }, [leads, searchTerm, serviceFilter, stageFilter]);

  // Linha em edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Lead | null>(null);

  const startEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setEditRow({ ...lead });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRow(null);
  };

  const saveEdit = () => {
    if (editRow) {
      onSaveLeadDetails(editRow);
      setEditingId(null);
      setEditRow(null);
    }
  };

  const moveStage = (lead: Lead, dir: 'forward' | 'backward') => {
    const idx = getStageIndex(lead.projeto_solar_etapa);
    const next = dir === 'forward' ? Math.min(idx + 1, 7) : Math.max(idx - 1, 0);
    if (next !== idx) {
      onSaveLeadDetails({ ...lead, projeto_solar_etapa: SOLAR_STAGES[next].key });
    }
  };

  const kpis = [
    { label: 'Projetos em Andamento', value: solarLeads.filter(l => l.projeto_solar_etapa !== 'Ativado').length, color: 'text-blue-600', border: 'border-t-blue-500' },
    { label: 'Capacidade Total (kWp)', value: `${solarLeads.reduce((a, l) => a + (l.solar_kwp || 0), 0).toFixed(1)} kWp`, color: 'text-emerald-600', border: 'border-t-emerald-500' },
    { label: 'Em Homologação/Vistoria', value: solarLeads.filter(l => ['Homologação', 'Vistoria'].includes(l.projeto_solar_etapa || '')).length, color: 'text-purple-600', border: 'border-t-purple-500' },
    { label: 'Sistemas Ativados', value: solarLeads.filter(l => l.projeto_solar_etapa === 'Ativado').length, color: 'text-emerald-700', border: 'border-t-emerald-600' },
  ];

  const inputCls = "w-full py-1 px-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-emerald-500 bg-white text-slate-800 font-medium";

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`bg-white rounded-xl border border-slate-200 border-t-4 ${k.border} shadow-sm p-4`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cliente, telefone, cidade..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={serviceFilter}
            onChange={e => setServiceFilter(e.target.value)}
            className="py-2 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white font-medium text-slate-600"
          >
            <option value="Todos">Todos os serviços</option>
            {uniqueServices.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="py-2 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white font-medium text-slate-600"
          >
            <option value="Todos">Todas as etapas</option>
            {SOLAR_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <span className="text-xs text-slate-400 font-medium ml-auto">{solarLeads.length} leads</span>
      </div>

      {/* Planilha */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {solarLeads.length === 0 ? (
          <div className="py-24 text-center">
            <Sun className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-medium">Nenhum lead encontrado.</p>
            <p className="text-slate-300 text-xs mt-1">Tente ajustar os filtros ou cadastre novos leads na aba Leads.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ minWidth: '1100px' }}>
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-4 py-3 w-[200px]">Cliente</th>
                  <th className="px-4 py-3 w-[120px]">WhatsApp</th>
                  <th className="px-4 py-3 w-[130px]">Localização</th>
                  <th className="px-4 py-3 w-[80px] text-center">kWp</th>
                  <th className="px-4 py-3 w-[80px] text-center">Painéis</th>
                  <th className="px-4 py-3 w-[140px]">Inversor</th>
                  <th className="px-4 py-3 w-[150px]">Protocolo</th>
                  <th className="px-4 py-3 w-[200px] text-center">Etapa da Instalação</th>
                  <th className="px-4 py-3 w-[110px] text-right">Investimento</th>
                  <th className="px-4 py-3 w-[80px] text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {solarLeads.map((lead, idx) => {
                  const isEditing = editingId === lead.id;
                  const row = isEditing ? editRow! : lead;
                  const stageIdx = getStageIndex(lead.projeto_solar_etapa);

                  return (
                    <tr
                      key={lead.id}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-emerald-50/30 transition-colors ${isEditing ? 'bg-yellow-50/60 ring-1 ring-inset ring-yellow-300' : ''}`}
                    >
                      {/* Cliente */}
                      <td className="px-4 py-2.5">
                        {isEditing ? (
                          <input className={inputCls} value={editRow!.nome} onChange={e => setEditRow({ ...editRow!, nome: e.target.value })} />
                        ) : (
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-tight">{lead.nome}</p>
                            {lead.email && <p className="text-[10px] text-slate-400 truncate max-w-[180px]">📧 {lead.email}</p>}
                          </div>
                        )}
                      </td>

                      {/* WhatsApp */}
                      <td className="px-4 py-2.5">
                        {isEditing ? (
                          <input className={inputCls} value={editRow!.whatsapp} onChange={e => setEditRow({ ...editRow!, whatsapp: e.target.value })} />
                        ) : (
                          <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-800 font-mono font-semibold group" onClick={e => e.stopPropagation()}>
                            <MessageCircle className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                            {lead.whatsapp}
                          </a>
                        )}
                      </td>

                      {/* Localização */}
                      <td className="px-4 py-2.5">
                        {isEditing ? (
                          <input className={inputCls} value={editRow!.localizacao || ''} onChange={e => setEditRow({ ...editRow!, localizacao: e.target.value })} placeholder="Cidade/UF" />
                        ) : (
                          <span className="text-xs text-slate-600 font-medium">{lead.localizacao || <span className="text-slate-300">—</span>}</span>
                        )}
                      </td>

                      {/* kWp */}
                      <td className="px-4 py-2.5 text-center">
                        {isEditing ? (
                          <input type="number" step="0.01" className={inputCls + " text-center"} value={editRow!.solar_kwp || ''} onChange={e => setEditRow({ ...editRow!, solar_kwp: e.target.value ? Number(e.target.value) : undefined })} placeholder="0.00" />
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 font-mono">
                            {lead.solar_kwp ? `${lead.solar_kwp} kWp` : <span className="text-slate-300 font-normal">—</span>}
                          </span>
                        )}
                      </td>

                      {/* Painéis */}
                      <td className="px-4 py-2.5 text-center">
                        {isEditing ? (
                          <input type="number" className={inputCls + " text-center"} value={editRow!.solar_paineis || ''} onChange={e => setEditRow({ ...editRow!, solar_paineis: e.target.value ? Number(e.target.value) : undefined })} placeholder="0" />
                        ) : (
                          <span className="text-xs font-bold text-slate-700 font-mono">
                            {lead.solar_paineis ? `${lead.solar_paineis}` : <span className="text-slate-300 font-normal">—</span>}
                          </span>
                        )}
                      </td>

                      {/* Inversor */}
                      <td className="px-4 py-2.5">
                        {isEditing ? (
                          <input className={inputCls} value={editRow!.solar_inversor || ''} onChange={e => setEditRow({ ...editRow!, solar_inversor: e.target.value })} placeholder="Ex: Deye 5kW" />
                        ) : (
                          <span className="text-xs text-slate-600 font-medium">{lead.solar_inversor || <span className="text-slate-300">—</span>}</span>
                        )}
                      </td>

                      {/* Protocolo */}
                      <td className="px-4 py-2.5">
                        {isEditing ? (
                          <input className={inputCls + " font-mono"} value={editRow!.solar_protocolo || ''} onChange={e => setEditRow({ ...editRow!, solar_protocolo: e.target.value })} placeholder="N° protocolo" />
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">{lead.solar_protocolo || <span className="text-slate-300">—</span>}</span>
                        )}
                      </td>

                      {/* Etapa */}
                      <td className="px-4 py-2.5">
                        {isEditing ? (
                          <select
                            className={inputCls + " font-semibold"}
                            value={editRow!.projeto_solar_etapa || 'Dimensionamento'}
                            onChange={e => setEditRow({ ...editRow!, projeto_solar_etapa: e.target.value })}
                          >
                            {SOLAR_STAGES.map(s => (
                              <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={stageIdx === 0}
                              onClick={() => moveStage(lead, 'backward')}
                              className="p-1 rounded bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0"
                              title="Recuar etapa"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <span className={`flex-1 text-center text-[10px] font-bold px-1.5 py-1 rounded border ${getStageColor(lead.projeto_solar_etapa)} whitespace-nowrap`}>
                              {getStageLabel(lead.projeto_solar_etapa)}
                            </span>
                            <button
                              disabled={stageIdx === 7}
                              onClick={() => moveStage(lead, 'forward')}
                              className="p-1 rounded bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0"
                              title="Avançar etapa"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Investimento */}
                      <td className="px-4 py-2.5 text-right">
                        {isEditing ? (
                          <input type="number" className={inputCls + " text-right font-mono"} value={editRow!.valor_fechado || editRow!.valor_proposta || ''} onChange={e => setEditRow({ ...editRow!, valor_proposta: e.target.value ? Number(e.target.value) : undefined })} placeholder="0" />
                        ) : (
                          <span className="text-xs font-bold font-mono text-slate-700">
                            {(lead.valor_fechado || lead.valor_proposta) ? `R$ ${(lead.valor_fechado || lead.valor_proposta || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : <span className="text-slate-300 font-normal">—</span>}
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="p-1.5 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm"
                                title="Salvar"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(lead)}
                                className="p-1.5 rounded bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all"
                                title="Editar linha"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenLeadDetails(lead)}
                                className="p-1.5 rounded bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100 transition-all"
                                title="Abrir modal completo"
                              >
                                <Sun className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legenda das etapas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Legenda — Etapas do Projeto Solar</p>
        <div className="flex flex-wrap gap-2">
          {SOLAR_STAGES.map(s => (
            <span key={s.key} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.color}`}>
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
