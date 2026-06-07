"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { updateLeadStatusAction, updateLeadDetailsAction, getLeadsAction } from '@/app/actions/leads';
import { env } from '@/config/env';
import { Lead, LeadStatus } from '@/types';
import { MessageCircle, Download, Filter, Plus, MoreHorizontal, Search, LayoutGrid, List, X, Clock, Save, Edit3, BarChart, Users, TrendingUp } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import AdminCMS from '@/components/AdminCMS';

// Função para formatar SLA (Data de Entrada)
const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Agora mesmo';
  if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)} horas`;
  return `Há ${Math.floor(diffInSeconds / 86400)} dias`;
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);

  // Novos Estados
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      if (!env.supabase.url || env.supabase.url.includes('placeholder')) {
        setConfigError(true);
        setLoading(false);
        return;
      }

      const res = await getLeadsAction();
      if (!res.success) {
        throw new Error(res.error);
      }
      setLeads(res.data || []);
    } catch (error: any) {
      console.error('Erro ao buscar leads:', error);
      alert(error.message || 'Erro ao carregar os leads.');
      if (error.message?.includes('Acesso não autorizado')) {
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await updateLeadStatusAction(id, newStatus as LeadStatus);
      if (!res.success) throw new Error(res.error);
      
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus as LeadStatus } : l));
      if (selectedLead?.id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus as LeadStatus });
      }
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      alert(error.message || 'Erro ao atualizar status.');
    }
  };

  const handleSaveLeadDetails = async (lead: Lead) => {
    try {
      const res = await updateLeadDetailsAction(lead);
      if (!res.success) throw new Error(res.error);
      
      setLeads(leads.map(l => l.id === lead.id ? lead : l));
      setSelectedLead(null); // Fechar modal
    } catch (error: any) {
      console.error('Erro ao salvar detalhes:', error);
      alert(error.message || 'Erro ao salvar detalhes. Verifique as configurações da tabela "leads" no Supabase.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Nome', 'WhatsApp', 'Localização', 'Serviço', 'Status', 'Perda Estimada', 'Valor Fechado', 'Observações'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(l => 
        [
          new Date(l.created_at).toLocaleDateString('pt-BR'),
          `"${l.nome}"`,
          `"${l.whatsapp}"`,
          `"${l.localizacao}"`,
          `"${l.servico}"`,
          `"${l.status}"`,
          l.perda_estimada || 0,
          l.valor_fechado || 0,
          `"${l.observacoes || ''}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filtragem
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.whatsapp.includes(searchTerm) ||
                          l.servico.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Cálculos KPI gerais
  const activeLeads = leads.filter(l => l.status !== 'Perdido');
  const totalValue = activeLeads.reduce((acc, l) => acc + (l.perda_estimada || 0), 0);
  const pendingLeads = activeLeads.filter(l => l.status === 'Pendente').length;
  const closedValue = leads.reduce((acc, l) => acc + (l.valor_fechado || 0), 0);

  // Métricas estratégicas adicionais para o Dashboard
  const totalLeadsCount = leads.length;
  const wonLeads = leads.filter(l => l.status === 'Concluído' || l.status === 'Pago');
  const wonCount = wonLeads.length;
  const lostCount = leads.filter(l => l.status === 'Perdido').length;
  
  // Taxa de Conversão: Ganhos / Total finalizados
  const totalClosedCount = wonCount + lostCount;
  const conversionRate = totalClosedCount > 0 
    ? Math.round((wonCount / totalClosedCount) * 100) 
    : 0;

  // Ticket Médio de Fechamento
  const leadsWithPrice = wonLeads.filter(l => (l.valor_fechado || 0) > 0);
  const averageTicket = leadsWithPrice.length > 0
    ? Math.round(closedValue / leadsWithPrice.length)
    : 0;

  // Distribuição por Serviços
  const serviceCounts = leads.reduce((acc: Record<string, number>, l) => {
    const s = l.servico || 'Outros';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const serviceDistribution = Object.entries(serviceCounts).map(([name, count]) => ({
    name,
    count,
    percentage: totalLeadsCount > 0 ? Math.round((count / totalLeadsCount) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // Estágios do Funil
  const funnelStages = [
    { name: 'Pendente (Novos)', count: leads.filter(l => l.status === 'Pendente').length, color: 'bg-orange-500' },
    { name: 'Em Atendimento', count: leads.filter(l => l.status === 'Em Atendimento').length, color: 'bg-blue-500' },
    { name: 'Concluído / Pago', count: wonCount, color: 'bg-emerald-500' },
    { name: 'Perdido (Sem Venda)', count: lostCount, color: 'bg-red-500' }
  ];

  // Maior valor no funil para normalização de largura das barras
  const maxFunnelCount = Math.max(...funnelStages.map(s => s.count), 1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Em Atendimento': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Concluído': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Pago': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'Perdido': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header Dinâmico */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {activeTab === 'dashboard' && (
            <>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Painel de Métricas & Insights</h1>
              <p className="text-xs text-slate-500 mt-1">Análise estratégica de conversão, serviços e funil de vendas.</p>
            </>
          )}
          {activeTab === 'leads' && (
            <>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Gestão Operacional de Leads</h1>
              <p className="text-xs text-slate-500 mt-1">Gerencie a evolução dos contatos e as negociações do funil.</p>
            </>
          )}
          {activeTab === 'relatorios' && (
            <>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Painel de Relatórios</h1>
              <p className="text-xs text-slate-500 mt-1">Exportação de dados e relatórios de auditoria.</p>
            </>
          )}
          {activeTab === 'editar-site' && (
            <>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Gerenciador de Conteúdo (CMS)</h1>
              <p className="text-xs text-slate-500 mt-1">Edite textos e imagens da landing page principal.</p>
            </>
          )}
        </div>

        {/* Botões Operacionais (Apenas na aba Leads) */}
        {activeTab === 'leads' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 rounded-md p-1 border border-slate-200">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs flex items-center transition-all ${viewMode === 'table' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded text-xs flex items-center transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <button onClick={exportToCSV} className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-md text-xs font-semibold hover:bg-slate-50 transition-all flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
          </div>
        )}
      </div>

      {/* VIEW: DASHBOARD ESTRATÉGICO */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-4 border-t-slate-400 shadow-sm flex flex-col justify-between h-28">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total de Leads</h3>
                <p className="text-2xl font-black text-slate-900">{totalLeadsCount}</p>
              </div>
              <p className="text-[9px] text-slate-400">Total acumulado de cadastros</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-4 border-t-brand-orange shadow-sm flex flex-col justify-between h-28">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Aguardando (Gargalo)</h3>
                <p className="text-2xl font-black text-brand-orange">{pendingLeads}</p>
              </div>
              <p className="text-[9px] text-slate-400">Leads que ainda não foram atendidos</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-4 border-t-purple-500 shadow-sm flex flex-col justify-between h-28">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ticket Médio</h3>
                <p className="text-2xl font-black text-purple-500">R$ {averageTicket.toLocaleString('pt-BR')}</p>
              </div>
              <p className="text-[9px] text-slate-400">Valor médio de contratos fechados</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-4 border-t-brand-emerald shadow-sm flex flex-col justify-between h-28">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Taxa de Conversão</h3>
                <p className="text-2xl font-black text-brand-emerald">{conversionRate}%</p>
              </div>
              <p className="text-[9px] text-slate-400">Proporção de vendas ganhas</p>
            </div>
          </div>

          {/* Gráficos em Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bloco 1: Funil de Vendas */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Etapas do Funil de Vendas</h2>
                <p className="text-[11px] text-slate-500">Número de leads em cada estágio de progresso.</p>
              </div>

              <div className="space-y-4">
                {funnelStages.map((stage) => {
                  const widthPercent = Math.max(Math.round((stage.count / maxFunnelCount) * 100), 2);
                  return (
                    <div key={stage.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{stage.name}</span>
                        <span className="font-bold">{stage.count} leads</span>
                      </div>
                      <div className="w-full bg-slate-100 h-6 rounded-md overflow-hidden relative border border-slate-100">
                        <div 
                          className={`h-full ${stage.color} rounded-r-md transition-all duration-500 shadow-sm`} 
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bloco 2: Distribuição de Serviços */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Distribuição de Interesse por Serviço</h2>
                <p className="text-[11px] text-slate-500">Qual serviço tem gerado maior volume de simulação/contato.</p>
              </div>

              {serviceDistribution.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-10">Nenhum lead cadastrado ainda.</p>
              ) : (
                <div className="space-y-4">
                  {serviceDistribution.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="truncate max-w-[70%]">{item.name}</span>
                        <span className="font-bold">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-emerald rounded-full transition-all duration-500" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Performance Financeira */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Faturamento e Pipeline Financeiro</h2>
              <p className="text-[11px] text-slate-500">Valores potenciais em negociação versus vendas efetivamente concluídas.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pipeline Estimado (Ativo)</span>
                <span className="text-xl font-bold text-blue-600">R$ {totalValue.toLocaleString('pt-BR')}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Faturamento Real (Ganho)</span>
                <span className="text-xl font-bold text-brand-emerald">R$ {closedValue.toLocaleString('pt-BR')}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ticket Médio</span>
                <span className="text-xl font-bold text-purple-600">R$ {averageTicket.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: RELATÓRIOS */}
      {activeTab === 'relatorios' && (
        <div className="bg-white p-12 rounded-md border border-slate-200 shadow-sm text-center">
          <BarChart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-700">Painel de Relatórios</h2>
          <p className="text-slate-500 text-sm mt-2">Módulo avançado de relatórios em desenvolvimento.</p>
        </div>
      )}

      {/* VIEW: EDITAR SITE CMS */}
      {activeTab === 'editar-site' && (
        <AdminCMS />
      )}

      {/* VIEW: GESTÃO OPERACIONAL DE LEADS */}
      {activeTab === 'leads' && (
        <>
          {/* Barra de Filtros */}
          <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nome, whatsapp..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald bg-white"
              >
                <option value="Todos">Todos os Status</option>
                <option value="Pendente">Pendente</option>
                <option value="Em Atendimento">Em Atendimento</option>
                <option value="Concluído">Concluído</option>
                <option value="Pago">Pago</option>
                <option value="Perdido">Perdido</option>
              </select>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Mostrando {filteredLeads.length} leads
            </div>
          </div>

          {configError ? (
            <div className="p-16 text-center bg-white rounded-md border border-slate-200">
              <div className="inline-block bg-orange-50 border border-orange-100 text-orange-800 p-6 rounded-lg max-w-sm">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <h3 className="font-bold text-base mb-2">Configuração Pendente</h3>
                <p className="text-xs leading-relaxed">Adicione as chaves do Supabase no arquivo <strong>.env.local</strong>.</p>
              </div>
            </div>
          ) : loading ? (
            <div className="p-12 text-center bg-white rounded-md border border-slate-200">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xs text-slate-400">Sincronizando...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-md border border-slate-200 text-slate-400 text-xs italic">
              Nenhum registro encontrado.
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 text-[10px] uppercase tracking-[0.1em] border-b border-slate-200">
                      <th className="px-6 py-4 font-bold">Entrada (SLA)</th>
                      <th className="px-6 py-4 font-bold">Cliente</th>
                      <th className="px-6 py-4 font-bold">Serviço</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Potencial</th>
                      <th className="px-6 py-4 font-bold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100">
                    {filteredLeads.map((lead, idx) => (
                      <tr key={lead.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-slate-50 transition-all`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{timeAgo(lead.created_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 cursor-pointer hover:text-brand-emerald flex items-center gap-2" onClick={() => setSelectedLead(lead)}>
                            {lead.nome} <Edit3 className="w-3 h-3 text-slate-400" />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{lead.whatsapp}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">
                            {lead.servico}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`text-[10px] font-bold rounded-md px-3 py-1.5 outline-none cursor-pointer border shadow-sm transition-all ${getStatusColor(lead.status)}`}
                          >
                            <option value="Pendente">Pendente</option>
                            <option value="Em Atendimento">Em Atendimento</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Pago">Pago</option>
                            <option value="Perdido">Perdido</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-700 text-right">
                          R$ {lead.perda_estimada || 0}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <a 
                              href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-2 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              title="Falar no WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Kanban View */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
              {['Pendente', 'Em Atendimento', 'Concluído', 'Pago'].map(colStatus => (
                <div key={colStatus} className="bg-slate-100 rounded-md p-3 border border-slate-200 min-w-[280px]">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{colStatus}</h3>
                    <span className="bg-white text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                      {filteredLeads.filter(l => l.status === colStatus).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {filteredLeads.filter(l => l.status === colStatus).map(lead => (
                      <div key={lead.id} className="bg-white p-3 rounded-md shadow-sm border border-slate-200 hover:border-brand-emerald cursor-pointer transition-all" onClick={() => setSelectedLead(lead)}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-xs text-slate-900">{lead.nome}</div>
                          <span className="text-[9px] text-slate-400">{timeAgo(lead.created_at)}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mb-2">{lead.servico}</div>
                        <div className="flex justify-between items-center">
                          <div className="font-mono text-xs font-bold text-brand-emerald">R$ {lead.perda_estimada}</div>
                          <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-600" onClick={(e) => e.stopPropagation()}>
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de Detalhes do Lead */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {selectedLead.nome}
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${getStatusColor(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">SLA: {timeAgo(selectedLead.created_at)} • Origem: Landing Page</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Contato & Local</label>
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <p><strong>WhatsApp:</strong> {selectedLead.whatsapp || <span className="text-slate-400 italic">Não informado</span>}</p>
                    <p><strong>E-mail:</strong> {selectedLead.email || <span className="text-slate-400 italic">Não informado</span>}</p>
                    <p><strong>Local:</strong> {selectedLead.localizacao} {selectedLead.cep && `(CEP: ${selectedLead.cep})`}</p>
                    {selectedLead.concessionaria && (
                      <p><strong>Concessionária:</strong> <span className="uppercase">{selectedLead.concessionaria}</span></p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Serviço de Interesse</label>
                  <div className="text-sm font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedLead.servico}
                    {selectedLead.valor_conta && selectedLead.valor_conta > 0 ? (
                      <span className="text-xs text-slate-500 font-normal block mt-1">
                        Gasto mensal com energia: <strong>R$ {selectedLead.valor_conta.toLocaleString('pt-BR')}</strong>
                      </span>
                    ) : null}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Potencial Financeiro</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Estimativa do Sistema</p>
                      <p className="text-lg font-bold text-slate-900">R$ {selectedLead.perda_estimada || 0}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-brand-emerald font-bold">Valor Fechado (Real)</p>
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-xs text-slate-400">R$</span>
                        <input 
                          type="number" 
                          value={selectedLead.valor_fechado || ''}
                          onChange={(e) => setSelectedLead({...selectedLead, valor_fechado: Number(e.target.value)})}
                          className="w-full pl-7 pr-2 py-1 text-sm border border-brand-emerald/30 rounded focus:outline-none focus:border-brand-emerald font-bold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Alterar Status</label>
                   <select 
                      value={selectedLead.status}
                      onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                      className="w-full py-2 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald bg-white font-medium"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em Atendimento">Em Atendimento</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Pago">Pago</option>
                      <option value="Perdido">Perdido</option>
                    </select>
                </div>
              </div>
              
              <div className="flex flex-col h-full">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex-shrink-0">
                  Histórico / Observações de Venda
                </label>
                <textarea 
                  value={selectedLead.observacoes || ''}
                  onChange={(e) => setSelectedLead({...selectedLead, observacoes: e.target.value})}
                  placeholder="Ex: Cliente pediu para retornar a ligação na terça-feira. Achou o valor inicial um pouco alto, oferecido desconto de 5%..."
                  className="w-full flex-1 min-h-[150px] p-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald bg-yellow-50/30 resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleSaveLeadDetails(selectedLead)}
                className="px-4 py-2 text-sm font-bold text-white bg-brand-emerald hover:bg-emerald-600 rounded-md shadow-sm transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Carregando painel...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
