"use client";

import React, { useState, useMemo } from 'react';
import { Lead } from '@/types';
import { Sun, ChevronLeft, ChevronRight, X, Edit3, MessageCircle, Check, Search, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface AdminSolarProjectsProps {
  leads: Lead[];
  onSaveLeadDetails: (lead: Lead) => void;
  onOpenLeadDetails: (lead: Lead) => void;
}

const SOLAR_STAGES = [
  { key: 'Dimensionamento', label: '1. Dimensionamento',   color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { key: 'Projeto',         label: '2. Projeto Elétrico',  color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { key: 'Homologação',     label: '3. Homologação',       color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { key: 'Logística',       label: '4. Logística',         color: 'bg-pink-100 text-pink-700 border-pink-300' },
  { key: 'Instalação',      label: '5. Instalação Física', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { key: 'Vistoria',        label: '6. Vistoria',          color: 'bg-teal-100 text-teal-700 border-teal-300' },
  { key: 'Medidor',         label: '7. Troca do Medidor',  color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { key: 'Ativado',         label: '8. Ativado ✓',         color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
];

function getStageColor(key?: string) {
  return SOLAR_STAGES.find(s => s.key === (key || 'Dimensionamento'))?.color ?? 'bg-slate-100 text-slate-600 border-slate-300';
}

function getStageLabel(key?: string) {
  return SOLAR_STAGES.find(s => s.key === (key || 'Dimensionamento'))?.label ?? '1. Dimensionamento';
}

function getStageIndex(key?: string) {
  const idx = SOLAR_STAGES.findIndex(s => s.key === (key || 'Dimensionamento'));
  return idx >= 0 ? idx : 0;
}

/** Retorna o status do prazo e quantos dias restam */
function getPrazoStatus(prazo?: string): { label: string; days: number; status: 'ok' | 'warning' | 'overdue' | 'none' } {
  if (!prazo) return { label: '—', days: 0, status: 'none' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(prazo + 'T00:00:00');
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0)  return { label: `${Math.abs(diff)}d atrasado`, days: diff, status: 'overdue' };
  if (diff === 0) return { label: 'Vence hoje!',               days: 0,    status: 'warning' };
  if (diff <= 3)  return { label: `Vence em ${diff}d`,         days: diff, status: 'warning' };
  return           { label: `${diff} dias`,                    days: diff, status: 'ok' };
}

export default function AdminSolarProjects({ leads, onSaveLeadDetails, onOpenLeadDetails }: AdminSolarProjectsProps) {
  const [searchTerm, setSearchTerm]   = useState('');
  const [stageFilter, setStageFilter] = useState('Todos');
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editRow, setEditRow]         = useState<Lead | null>(null);

  const allSolarLeads = useMemo(() =>
    leads.filter(l => l.servico?.toLowerCase().includes('solar') || l.servico === 'Energia Solar'),
    [leads]
  );

  const solarLeads = useMemo(() => allSolarLeads.filter(l => {
    const matchSearch = !searchTerm ||
      l.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.whatsapp.includes(searchTerm) ||
      (l.localizacao && l.localizacao.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStage = stageFilter === 'Todos' || (l.projeto_solar_etapa || 'Dimensionamento') === stageFilter;
    return matchSearch && matchStage;
  }), [allSolarLeads, searchTerm, stageFilter]);

  // Alertas: vencidos ou vencendo em 3 dias e com pendência
  const alertLeads = useMemo(() => allSolarLeads.filter(l => {
    const { status } = getPrazoStatus(l.solar_prazo_etapa);
    return status === 'overdue' || status === 'warning' || !!l.solar_pendencia;
  }), [allSolarLeads]);

  const startEdit = (lead: Lead) => { setEditingId(lead.id); setEditRow({ ...lead }); };
  const cancelEdit = () => { setEditingId(null); setEditRow(null); };
  const saveEdit = () => { if (editRow) { onSaveLeadDetails(editRow); setEditingId(null); setEditRow(null); } };

  const moveStage = (lead: Lead, dir: 'forward' | 'backward') => {
    const idx = getStageIndex(lead.projeto_solar_etapa);
    const next = dir === 'forward' ? Math.min(idx + 1, 7) : Math.max(idx - 1, 0);
    if (next !== idx) onSaveLeadDetails({ ...lead, projeto_solar_etapa: SOLAR_STAGES[next].key });
  };

  const kpis = [
    { label: 'Em Andamento',          value: allSolarLeads.filter(l => l.projeto_solar_etapa !== 'Ativado').length,                                   color: 'text-blue-600',    border: 'border-t-blue-500' },
    { label: 'Capacidade Total (kWp)', value: `${allSolarLeads.reduce((a, l) => a + (l.solar_kwp || 0), 0).toFixed(1)} kWp`,                          color: 'text-emerald-600', border: 'border-t-emerald-500' },
    { label: 'Prazo Atrasado',         value: allSolarLeads.filter(l => getPrazoStatus(l.solar_prazo_etapa).status === 'overdue').length,              color: 'text-red-600',     border: 'border-t-red-500' },
    { label: 'Sistemas Ativados',      value: allSolarLeads.filter(l => l.projeto_solar_etapa === 'Ativado').length,                                   color: 'text-emerald-700', border: 'border-t-emerald-600' },
  ];

  const inputCls   = "w-full py-1 px-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-emerald-500 bg-white text-slate-800 font-medium";
  const prazoColor = { ok: 'text-emerald-600 bg-emerald-50 border-emerald-200', warning: 'text-orange-600 bg-orange-50 border-orange-200', overdue: 'text-red-600 bg-red-50 border-red-200', none: 'text-slate-300' };

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

      {/* Painel de Alertas */}
      {alertLeads.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest">
              Alertas de Projetos Solares — {alertLeads.length} atenção necessária
            </h3>
          </div>
          <div className="space-y-2">
            {alertLeads.map(l => {
              const prazo = getPrazoStatus(l.solar_prazo_etapa);
              return (
                <div
                  key={l.id}
                  onClick={() => onOpenLeadDetails(l)}
                  className="bg-white border border-amber-100 rounded-lg p-3 flex flex-wrap items-center gap-3 cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all"
                >
                  {/* Status do prazo */}
                  {prazo.status !== 'none' && (
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${prazoColor[prazo.status]}`}>
                      {prazo.status === 'overdue'
                        ? <AlertTriangle className="w-3 h-3" />
                        : <Clock className="w-3 h-3" />}
                      {prazo.label}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{l.nome}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {getStageLabel(l.projeto_solar_etapa)}
                      {l.solar_pendencia && <span className="text-amber-700 ml-2">⚠ {l.solar_pendencia}</span>}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${l.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded hover:bg-emerald-100 transition-all flex-shrink-0"
                  >
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg flex-shrink-0">
          <Sun className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-bold text-emerald-700">Energia Solar</span>
        </div>
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cliente, telefone, cidade..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="py-2 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white font-medium text-slate-600"
        >
          <option value="Todos">Todas as etapas</option>
          {SOLAR_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <span className="text-xs text-slate-400 font-medium ml-auto">{solarLeads.length} projetos</span>
      </div>

      {/* Planilha */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {solarLeads.length === 0 ? (
          allSolarLeads.length === 0 ? (
            <div className="py-20 text-center px-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-2xl mb-4">
                <Sun className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-slate-700 text-sm font-bold mb-1">Nenhum projeto solar cadastrado</p>
              <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                Vá na aba <strong>Leads</strong>, clique em ✏️ editar e altere o <strong>Serviço</strong> para <strong>"Energia Solar"</strong>.
              </p>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm">Nenhum projeto encontrado para os filtros selecionados.</p>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ minWidth: '1280px' }}>
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-4 py-3 w-[180px]">Cliente</th>
                  <th className="px-4 py-3 w-[110px]">WhatsApp</th>
                  <th className="px-4 py-3 w-[110px]">Localização</th>
                  <th className="px-4 py-3 w-[70px] text-center">kWp</th>
                  <th className="px-4 py-3 w-[65px] text-center">Painéis</th>
                  <th className="px-4 py-3 w-[120px]">Inversor</th>
                  <th className="px-4 py-3 w-[190px] text-center">Etapa</th>
                  <th className="px-4 py-3 w-[130px] text-center">
                    <span className="flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Prazo Etapa</span>
                  </th>
                  <th className="px-4 py-3 w-[200px]">
                    <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Pendência</span>
                  </th>
                  <th className="px-4 py-3 w-[80px] text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {solarLeads.map((lead, idx) => {
                  const isEditing = editingId === lead.id;
                  const row = isEditing ? editRow! : lead;
                  const stageIdx = getStageIndex(lead.projeto_solar_etapa);
                  const prazo = getPrazoStatus(lead.solar_prazo_etapa);

                  // Cor da linha se tiver alerta
                  const rowBg = isEditing
                    ? 'bg-yellow-50/70 ring-1 ring-inset ring-yellow-300'
                    : prazo.status === 'overdue'
                      ? 'bg-red-50/40'
                      : prazo.status === 'warning'
                        ? 'bg-orange-50/40'
                        : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';

                  return (
                    <tr key={lead.id} className={`hover:bg-emerald-50/20 transition-colors ${rowBg}`}>

                      {/* Cliente */}
                      <td className="px-4 py-2.5">
                        {isEditing
                          ? <input className={inputCls} value={row.nome} onChange={e => setEditRow({ ...editRow!, nome: e.target.value })} />
                          : (
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-tight">{lead.nome}</p>
                              {lead.email && <p className="text-[9px] text-slate-400 truncate max-w-[160px]">📧 {lead.email}</p>}
                            </div>
                          )}
                      </td>

                      {/* WhatsApp */}
                      <td className="px-4 py-2.5">
                        {isEditing
                          ? <input className={inputCls} value={row.whatsapp} onChange={e => setEditRow({ ...editRow!, whatsapp: e.target.value })} />
                          : (
                            <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-800 font-mono font-semibold group" onClick={e => e.stopPropagation()}>
                              <MessageCircle className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                              {lead.whatsapp}
                            </a>
                          )}
                      </td>

                      {/* Localização */}
                      <td className="px-4 py-2.5">
                        {isEditing
                          ? <input className={inputCls} value={row.localizacao || ''} onChange={e => setEditRow({ ...editRow!, localizacao: e.target.value })} placeholder="Cidade/UF" />
                          : <span className="text-xs text-slate-600 font-medium">{lead.localizacao || <span className="text-slate-300">—</span>}</span>}
                      </td>

                      {/* kWp */}
                      <td className="px-4 py-2.5 text-center">
                        {isEditing
                          ? <input type="number" step="0.01" className={inputCls + " text-center"} value={row.solar_kwp || ''} onChange={e => setEditRow({ ...editRow!, solar_kwp: e.target.value ? Number(e.target.value) : undefined })} placeholder="0.00" />
                          : <span className="text-xs font-bold text-emerald-700 font-mono">{lead.solar_kwp ? `${lead.solar_kwp}` : <span className="text-slate-300 font-normal">—</span>}</span>}
                      </td>

                      {/* Painéis */}
                      <td className="px-4 py-2.5 text-center">
                        {isEditing
                          ? <input type="number" className={inputCls + " text-center"} value={row.solar_paineis || ''} onChange={e => setEditRow({ ...editRow!, solar_paineis: e.target.value ? Number(e.target.value) : undefined })} placeholder="0" />
                          : <span className="text-xs font-bold text-slate-700 font-mono">{lead.solar_paineis || <span className="text-slate-300 font-normal">—</span>}</span>}
                      </td>

                      {/* Inversor */}
                      <td className="px-4 py-2.5">
                        {isEditing
                          ? <input className={inputCls} value={row.solar_inversor || ''} onChange={e => setEditRow({ ...editRow!, solar_inversor: e.target.value })} placeholder="Ex: Deye 5kW" />
                          : <span className="text-xs text-slate-600 font-medium">{lead.solar_inversor || <span className="text-slate-300">—</span>}</span>}
                      </td>

                      {/* Etapa */}
                      <td className="px-4 py-2.5">
                        {isEditing
                          ? (
                            <select className={inputCls + " font-semibold"}
                              value={row.projeto_solar_etapa || 'Dimensionamento'}
                              onChange={e => setEditRow({ ...editRow!, projeto_solar_etapa: e.target.value })}>
                              {SOLAR_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button disabled={stageIdx === 0} onClick={() => moveStage(lead, 'backward')}
                                className="p-1 rounded bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0">
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <span className={`flex-1 text-center text-[10px] font-bold px-1.5 py-1 rounded border ${getStageColor(lead.projeto_solar_etapa)} whitespace-nowrap`}>
                                {getStageLabel(lead.projeto_solar_etapa)}
                              </span>
                              <button disabled={stageIdx === 7} onClick={() => moveStage(lead, 'forward')}
                                className="p-1 rounded bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0">
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                      </td>

                      {/* Prazo da Etapa */}
                      <td className="px-4 py-2.5 text-center">
                        {isEditing
                          ? (
                            <input type="date" className={inputCls + " text-center"}
                              value={row.solar_prazo_etapa || ''}
                              onChange={e => setEditRow({ ...editRow!, solar_prazo_etapa: e.target.value || undefined })} />
                          ) : prazo.status === 'none'
                            ? <span className="text-slate-300 text-xs">—</span>
                            : (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {new Date(lead.solar_prazo_etapa! + 'T00:00:00').toLocaleDateString('pt-BR')}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${prazoColor[prazo.status]}`}>
                                  {prazo.label}
                                </span>
                              </div>
                            )}
                      </td>

                      {/* Pendência */}
                      <td className="px-4 py-2.5">
                        {isEditing
                          ? (
                            <input className={inputCls}
                              value={row.solar_pendencia || ''}
                              onChange={e => setEditRow({ ...editRow!, solar_pendencia: e.target.value || undefined })}
                              placeholder="Ex: Aguardando resposta concessionária..." />
                          ) : lead.solar_pendencia
                            ? (
                              <div className="flex items-start gap-1.5">
                                <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                <span className="text-[11px] text-amber-700 font-medium leading-tight">{lead.solar_pendencia}</span>
                              </div>
                            )
                            : (
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <span className="text-[10px] text-slate-300">Sem pendências</span>
                              </div>
                            )}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button onClick={saveEdit} className="p-1.5 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm" title="Salvar">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={cancelEdit} className="p-1.5 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all" title="Cancelar">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(lead)} className="p-1.5 rounded bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all" title="Editar linha">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => onOpenLeadDetails(lead)} className="p-1.5 rounded bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100 transition-all" title="Detalhes completos">
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

      {/* Legenda */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Legenda — Etapas</p>
        <div className="flex flex-wrap gap-2">
          {SOLAR_STAGES.map(s => (
            <span key={s.key} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.color}`}>{s.label}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">✓ No prazo</span>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">⚡ Vence em breve</span>
          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">⚠ Atrasado</span>
        </div>
      </div>
    </div>
  );
}
