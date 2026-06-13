"use client";

import React, { useEffect, useState } from 'react';
import { ServiceTracking, Lead, Company } from '@/types';
import { getTrackingsAction, saveTrackingAction, deleteTrackingAction } from '@/app/actions/trackings';
import { getLeadsAction } from '@/app/actions/leads';
import { getCompaniesAction } from '@/app/actions/companies';
import { servicesConfig } from '@/config/services';
import { getSiteSettingsAction, saveSiteSettingsAction } from '@/app/actions/settings';
import { 
  ClipboardList, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Edit3, 
  Check, 
  Loader2, 
  X, 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar, 
  AlertCircle, 
  Send,
  MessageCircle,
  Building,
  User,
  Clock,
  Settings
} from 'lucide-react';

const ETAPAS = [
  { id: 'planejamento', label: 'Planejamento / Projeto', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'agendamento', label: 'Agendamento', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'execucao', label: 'Em Execução', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { id: 'vistoria', label: 'Vistoria / Testes', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'finalizado', label: 'Finalizado', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
];

const DEFAULT_TEMPLATES = {
  avisar_etapa: "Olá {cliente}! Passando para informar que o andamento do seu serviço de '{servico}' (realizado pela nossa empresa parceira homologada {empresa}) avançou para a etapa: '{etapa}'. Qualquer dúvida, conte conosco!",
  cobrar_empresa: "Olá {responsavel} da {empresa}! Aqui é da equipe Hubly Pro. Estamos acompanhando o serviço de '{servico}' para o cliente {cliente} e gostaríamos de solicitar uma atualização sobre a etapa atual: '{etapa}'. Como está o andamento? Há alguma pendência?",
  cobrar_cliente: "Olá {cliente}! Aqui é do Hubly Pro. Gostaríamos de avisar que precisamos de um retorno/ação sua para avançarmos com o serviço de '{servico}' (prestado pela {empresa}) na etapa '{etapa}'. Por favor, entre em contato quando puder. Obrigado!",
  avisar_conclusao: "Olá {cliente}! Temos o prazer de informar que o seu serviço de '{servico}' realizado pela empresa homologada {empresa} foi concluído com sucesso! 🎉 Agradecemos pela confiança no Hubly Pro.",
  feedback: "Olá {cliente}! Como o seu serviço de '{servico}' com a {empresa} foi finalizado, gostaríamos muito de saber como foi a sua experiência. O seu feedback nos ajuda a manter o alto padrão de qualidade das nossas empresas homologadas! Como você avalia o serviço prestado?"
};

export default function AdminServiceTrackings() {
  const [trackings, setTrackings] = useState<ServiceTracking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modelos de Mensagem (Templates)
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [editingTemplates, setEditingTemplates] = useState(DEFAULT_TEMPLATES);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [etapaFilter, setEtapaFilter] = useState('Todos');
  const [companyFilter, setCompanyFilter] = useState('Todos');

  // Modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [editingTracking, setEditingTracking] = useState<ServiceTracking | null>(null);
  
  // Estado de notificação
  const [selectedTracking, setSelectedTracking] = useState<ServiceTracking | null>(null);
  const [msgType, setMsgType] = useState<'cobrar' | 'avisar_etapa' | 'avisar_conclusao' | 'feedback'>('avisar_etapa');
  const [recipient, setRecipient] = useState<'cliente' | 'empresa'>('cliente');
  const [customMsgText, setCustomMsgText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [trackingsRes, leadsRes, companiesRes, templatesRes] = await Promise.all([
        getTrackingsAction(),
        getLeadsAction(),
        getCompaniesAction(),
        getSiteSettingsAction('tracking_templates')
      ]);

      if (trackingsRes.success) setTrackings(trackingsRes.data || []);
      if (leadsRes.success) setLeads(leadsRes.data || []);
      if (companiesRes.success) setCompanies(companiesRes.data || []);
      if (templatesRes.success && templatesRes.data) {
        setTemplates({ ...DEFAULT_TEMPLATES, ...templatesRes.data });
      } else {
        setTemplates(DEFAULT_TEMPLATES);
      }

      if (!trackingsRes.success || !leadsRes.success || !companiesRes.success) {
        setErrorMsg('Alguns dados não puderam ser carregados corretamente do banco de dados.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erro de conexão ao buscar os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingTracking({
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      cliente_nome: '',
      cliente_whatsapp: '',
      cliente_email: '',
      servico: servicesConfig[0].title,
      empresa_id: '',
      empresa_nome: '',
      etapa: 'planejamento',
      data_inicio: new Date().toISOString().split('T')[0],
      data_previsao: '',
      observacoes: ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (tracking: ServiceTracking) => {
    setEditingTracking({ ...tracking });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este acompanhamento de serviço?')) return;

    try {
      setSaving(true);
      const res = await deleteTrackingAction(id);
      if (res.success) {
        showSuccess('Acompanhamento excluído com sucesso!');
        fetchData();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir acompanhamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTracking) return;
    if (!editingTracking.cliente_nome.trim()) {
      alert('O Nome do Cliente é obrigatório!');
      return;
    }
    if (!editingTracking.empresa_nome.trim()) {
      alert('Selecione uma Empresa Responsável!');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      const res = await saveTrackingAction(editingTracking);
      if (res.success) {
        showSuccess('Acompanhamento salvo com sucesso!');
        setIsEditModalOpen(false);
        setEditingTracking(null);
        fetchData();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar o acompanhamento.');
    } finally {
      setSaving(false);
    }
  };

  // Preenche dados ao selecionar um lead cadastrado
  const handleSelectLead = (leadId: string) => {
    if (!editingTracking) return;
    if (!leadId) {
      setEditingTracking({
        ...editingTracking,
        lead_id: undefined,
        cliente_nome: '',
        cliente_whatsapp: '',
        cliente_email: ''
      });
      return;
    }
    
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setEditingTracking({
        ...editingTracking,
        lead_id: lead.id,
        cliente_nome: lead.nome,
        cliente_whatsapp: lead.whatsapp,
        cliente_email: lead.email || '',
        servico: lead.servico
      });
    }
  };

  // Preenche dados ao selecionar uma empresa cadastrada
  const handleSelectCompany = (companyId: string) => {
    if (!editingTracking) return;
    if (!companyId) {
      setEditingTracking({
        ...editingTracking,
        empresa_id: '',
        empresa_nome: '',
        empresa_whatsapp: undefined,
        empresa_email: undefined
      });
    }
  };

  // Alteração inline de etapa na tabela
  const handleInlineStageChange = async (id: string, newEtapa: typeof ETAPAS[number]['id']) => {
    const tracking = trackings.find(t => t.id === id);
    if (!tracking) return;

    const updatedTracking = { ...tracking, etapa: newEtapa as any };
    
    // Atualização otimista
    setTrackings(trackings.map(t => t.id === id ? updatedTracking : t));

    try {
      const res = await saveTrackingAction(updatedTracking);
      if (res.success) {
        showSuccess('Etapa atualizada com sucesso!');
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar a etapa.');
      fetchData(); // Rollback
    }
  };

  // Lógica de Geração de Frases Prontas
  const generateMessage = (tracking: ServiceTracking, type: typeof msgType, target: typeof recipient) => {
    const cliente = tracking.cliente_nome;
    const servico = tracking.servico;
    const empresa = tracking.empresa_nome;
    const etapaLabel = ETAPAS.find(e => e.id === tracking.etapa)?.label || tracking.etapa;
    const respNome = companies.find(c => c.id === tracking.empresa_id)?.responsavel_nome || 'Responsável';

    let templateText = '';
    if (type === 'cobrar') {
      if (target === 'empresa') {
        templateText = templates.cobrar_empresa;
      } else {
        templateText = templates.cobrar_cliente;
      }
    } else if (type === 'avisar_etapa') {
      templateText = templates.avisar_etapa;
    } else if (type === 'avisar_conclusao') {
      templateText = templates.avisar_conclusao;
    } else if (type === 'feedback') {
      templateText = templates.feedback;
    }

    return templateText
      .replace(/{cliente}/g, cliente)
      .replace(/{servico}/g, servico)
      .replace(/{empresa}/g, empresa)
      .replace(/{etapa}/g, etapaLabel)
      .replace(/{responsavel}/g, respNome);
  };

  const handleOpenNotify = (tracking: ServiceTracking) => {
    setSelectedTracking(tracking);
    // Definir defaults
    setMsgType('avisar_etapa');
    setRecipient('cliente');
    
    const initialMsg = generateMessage(tracking, 'avisar_etapa', 'cliente');
    setCustomMsgText(initialMsg);
    setIsNotifyModalOpen(true);
  };

  // Atualiza mensagem quando mudamos destinatário ou tipo
  const handleNotifyConfigChange = (newType: typeof msgType, newRecipient: typeof recipient) => {
    setMsgType(newType);
    setRecipient(newRecipient);
    if (selectedTracking) {
      const msg = generateMessage(selectedTracking, newType, newRecipient);
      setCustomMsgText(msg);
    }
  };

  const sendWhatsApp = () => {
    if (!selectedTracking) return;
    const phone = recipient === 'cliente' 
      ? selectedTracking.cliente_whatsapp 
      : selectedTracking.empresa_whatsapp || '';
      
    if (!phone) {
      alert('Número de WhatsApp não cadastrado!');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMsgText)}`;
    window.open(url, '_blank');
  };

  const sendEmail = () => {
    if (!selectedTracking) return;
    const email = recipient === 'cliente' 
      ? selectedTracking.cliente_email 
      : selectedTracking.empresa_email || '';
      
    if (!email) {
      alert('E-mail não cadastrado!');
      return;
    }
    const subject = `Acompanhamento de Serviço Hubly Pro: ${selectedTracking.servico}`;
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(customMsgText)}`;
    window.open(url, '_blank');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Filtragem local
  const filteredTrackings = trackings.filter(t => {
    const matchesSearch = 
      t.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.servico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.empresa_nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEtapa = etapaFilter === 'Todos' || t.etapa === etapaFilter;
    const matchesCompany = companyFilter === 'Todos' || t.empresa_id === companyFilter;

    return matchesSearch && matchesEtapa && matchesCompany;
  });

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Barra de Ações & Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Busca */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por cliente, serviço, empresa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
            />
          </div>

          {/* Filtro de Etapa */}
          <select 
            value={etapaFilter}
            onChange={(e) => setEtapaFilter(e.target.value)}
            className="py-2 px-3 text-xs border border-slate-200 rounded-md focus:outline-none bg-white font-medium text-slate-600"
          >
            <option value="Todos">Todas as Etapas</option>
            {ETAPAS.map(e => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>

          {/* Filtro de Empresa */}
          <select 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="py-2 px-3 text-xs border border-slate-200 rounded-md focus:outline-none bg-white font-medium text-slate-600"
          >
            <option value="Todos">Todas as Empresas</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.nome_fantasia}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button 
            onClick={() => {
              setEditingTemplates({ ...templates });
              setIsTemplatesModalOpen(true);
            }}
            className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-md text-xs font-semibold hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" /> Configurar Frases
          </button>
          <button 
            onClick={handleOpenCreate}
            className="bg-brand-emerald text-white px-3 py-2 rounded-md text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Acompanhamento
          </button>
        </div>
      </div>

      {/* Lista / Tabela */}
      {loading ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 shadow-sm text-center">
          <Loader2 className="w-8 h-8 text-brand-emerald animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-xs">Sincronizando acompanhamentos...</p>
        </div>
      ) : filteredTrackings.length === 0 ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400 text-xs italic">
          Nenhum acompanhamento de serviço cadastrado ou compatível com os filtros atuais.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/85 text-slate-500 text-[10px] uppercase tracking-[0.1em] border-b border-slate-200">
                  <th className="px-6 py-4 font-bold">Cliente / Contato</th>
                  <th className="px-6 py-4 font-bold">Serviço</th>
                  <th className="px-6 py-4 font-bold">Empresa Responsável</th>
                  <th className="px-6 py-4 font-bold">Etapa Atual</th>
                  <th className="px-6 py-4 font-bold">Cronograma</th>
                  <th className="px-6 py-4 font-bold text-center">Notificar</th>
                  <th className="px-6 py-4 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredTrackings.map((t) => {
                  const currentEtapa = ETAPAS.find(e => e.id === t.etapa);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Cliente */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {t.cliente_nome}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 space-y-0.5">
                          <div>📱 {t.cliente_whatsapp}</div>
                          {t.cliente_email && <div>📧 {t.cliente_email}</div>}
                        </div>
                      </td>

                      {/* Serviço */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200/60 font-bold text-slate-700 text-[10px] uppercase tracking-wide">
                          {t.servico}
                        </span>
                      </td>

                      {/* Empresa */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {t.empresa_nome}
                        </div>
                        {t.empresa_whatsapp && (
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">📱 {t.empresa_whatsapp}</div>
                        )}
                      </td>

                      {/* Etapa */}
                      <td className="px-6 py-4">
                        <select
                          value={t.etapa}
                          onChange={(e) => handleInlineStageChange(t.id, e.target.value as any)}
                          className={`text-[9px] font-black uppercase tracking-wider border rounded-full px-2.5 py-1 outline-none cursor-pointer border shadow-sm transition-all bg-transparent ${currentEtapa?.color || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                        >
                          {ETAPAS.map(e => (
                            <option key={e.id} value={e.id} className="bg-white text-slate-800 font-semibold">{e.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Cronograma */}
                      <td className="px-6 py-4 space-y-1">
                        {t.data_inicio && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Início: {new Date(t.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                        {t.data_previsao ? (
                          <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>Previsão: {new Date(t.data_previsao + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                          </div>
                        ) : (
                          <div className="text-[9px] italic text-slate-400">Previsão não definida</div>
                        )}
                      </td>

                      {/* Notificar */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenNotify(t)}
                          className="bg-brand-emerald/10 hover:bg-brand-emerald text-brand-emerald hover:text-white border border-brand-emerald/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                          title="Enviar aviso ou cobrar via Whats/Email"
                        >
                          <Send className="w-3 h-3" /> Notificar
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:text-brand-emerald hover:bg-slate-50 transition-all cursor-pointer"
                            title="Editar Acompanhamento"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 rounded border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR / EDITAR */}
      {isEditModalOpen && editingTracking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-emerald/10 text-brand-emerald rounded-lg">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {trackings.some(t => t.id === editingTracking.id) ? 'Editar Acompanhamento' : 'Novo Acompanhamento de Serviço'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure o vínculo do serviço, cliente, empresa homologada e datas.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Seção 1: Vínculo do Cliente / Lead */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">1. Vínculo do Cliente</h4>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Selecionar de Leads Cadastrados (Opcional)</label>
                  <select 
                    value={editingTracking.lead_id || ''}
                    onChange={(e) => handleSelectLead(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-emerald cursor-pointer"
                  >
                    <option value="">-- Cadastrar Cliente Manualmente --</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.nome} ({l.servico})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Cliente *</label>
                    <input 
                      type="text" 
                      required
                      value={editingTracking.cliente_nome}
                      onChange={(e) => setEditingTracking({ ...editingTracking, cliente_nome: e.target.value })}
                      placeholder="Ex: João da Silva"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">WhatsApp do Cliente *</label>
                    <input 
                      type="text" 
                      required
                      value={editingTracking.cliente_whatsapp}
                      onChange={(e) => setEditingTracking({ ...editingTracking, cliente_whatsapp: e.target.value })}
                      placeholder="Ex: (48) 99999-9999"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">E-mail do Cliente</label>
                    <input 
                      type="email" 
                      value={editingTracking.cliente_email}
                      onChange={(e) => setEditingTracking({ ...editingTracking, cliente_email: e.target.value })}
                      placeholder="cliente@email.com"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Serviço e Empresa */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">2. Serviço e Empresa Parceira</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Serviço Contratado</label>
                    <select
                      value={editingTracking.servico}
                      onChange={(e) => setEditingTracking({ ...editingTracking, servico: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none"
                    >
                      {servicesConfig.map(s => (
                        <option key={s.id} value={s.title}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Empresa Homologada Responsável *</label>
                    <select 
                      value={editingTracking.empresa_id}
                      onChange={(e) => handleSelectCompany(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-emerald"
                    >
                      <option value="">-- Selecione uma Empresa --</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.nome_fantasia}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 3: Cronograma e Etapa */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">3. Acompanhamento Operacional</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Etapa Atual</label>
                    <select
                      value={editingTracking.etapa}
                      onChange={(e) => setEditingTracking({ ...editingTracking, etapa: e.target.value as any })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-emerald"
                    >
                      {ETAPAS.map(e => (
                        <option key={e.id} value={e.id}>{e.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Data de Início</label>
                    <input 
                      type="date" 
                      value={editingTracking.data_inicio || ''}
                      onChange={(e) => setEditingTracking({ ...editingTracking, data_inicio: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Previsão de Finalização</label>
                    <input 
                      type="date" 
                      value={editingTracking.data_previsao || ''}
                      onChange={(e) => setEditingTracking({ ...editingTracking, data_previsao: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Observações Internas</label>
                  <textarea 
                    value={editingTracking.observacoes || ''}
                    onChange={(e) => setEditingTracking({ ...editingTracking, observacoes: e.target.value })}
                    placeholder="Condições especiais, relatórios, atrasos ou notas de vistoria."
                    className="w-full text-xs p-3 border border-slate-200 rounded-md focus:outline-none min-h-[80px]"
                  />
                </div>
              </div>
            </form>

            {/* Footer Modal */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Salvar Acompanhamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ENVIAR NOTIFICAÇÃO (FRASES PRONTAS) */}
      {isNotifyModalOpen && selectedTracking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-emerald/10 text-brand-emerald rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Enviar Notificação (Frases Prontas)</h3>
                  <p className="text-[11px] text-slate-500">Selecione o tipo de notificação e o destinatário.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNotifyModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Configuração do Envio */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Destinatário */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Destinatário</label>
                  <div className="flex bg-slate-100 rounded-md p-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleNotifyConfigChange(msgType, 'cliente')}
                      className={`flex-1 py-1.5 rounded text-[11px] font-bold transition-all ${
                        recipient === 'cliente' 
                          ? 'bg-white text-slate-800 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Cliente
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNotifyConfigChange(msgType, 'empresa')}
                      className={`flex-1 py-1.5 rounded text-[11px] font-bold transition-all ${
                        recipient === 'empresa' 
                          ? 'bg-white text-slate-800 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Empresa
                    </button>
                  </div>
                </div>

                {/* Tipo de Mensagem */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Objetivo da Frase</label>
                  <select
                    value={msgType}
                    onChange={(e) => handleNotifyConfigChange(e.target.value as any, recipient)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-emerald cursor-pointer"
                  >
                    <option value="avisar_etapa">Avisar Etapa Atual</option>
                    <option value="cobrar">Cobrar Etapa / Alerta</option>
                    <option value="avisar_conclusao">Avisar Finalização</option>
                    <option value="feedback">Feedback de Finalização</option>
                  </select>
                </div>
              </div>

              {/* Informações do Destinatário */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Informações de Contato</span>
                {recipient === 'cliente' ? (
                  <div className="text-xs space-y-0.5 text-slate-600">
                    <p className="font-bold text-slate-800">Cliente: {selectedTracking.cliente_nome}</p>
                    <p>WhatsApp: {selectedTracking.cliente_whatsapp}</p>
                    {selectedTracking.cliente_email && <p>E-mail: {selectedTracking.cliente_email}</p>}
                  </div>
                ) : (
                  <div className="text-xs space-y-0.5 text-slate-600">
                    <p className="font-bold text-slate-800">Empresa: {selectedTracking.empresa_nome}</p>
                    {selectedTracking.empresa_whatsapp ? (
                      <p>WhatsApp: {selectedTracking.empresa_whatsapp}</p>
                    ) : (
                      <p className="text-red-500 font-semibold">⚠️ WhatsApp não cadastrado para a empresa</p>
                    )}
                    {selectedTracking.empresa_email && <p>E-mail: {selectedTracking.empresa_email}</p>}
                  </div>
                )}
              </div>

              {/* Pré-visualização da Mensagem */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Texto da Mensagem (Editável)</label>
                <textarea
                  value={customMsgText}
                  onChange={(e) => setCustomMsgText(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-emerald min-h-[140px] leading-relaxed"
                  placeholder="Escreva a mensagem..."
                />
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
              <button 
                type="button" 
                onClick={() => setIsNotifyModalOpen(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>

              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={sendEmail}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  <Mail className="w-4 h-4" /> Enviar por E-mail
                </button>
                <button 
                  type="button"
                  onClick={sendWhatsApp}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
                >
                  <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURAR FRASES PRONTAS */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-emerald/10 text-brand-emerald rounded-lg">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-montserrat uppercase tracking-tight">Configurar Frases Prontas</h3>
                  <p className="text-[11px] text-slate-500">Personalize os modelos de mensagens disparados pelo sistema.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Placeholders Disponíveis</span>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Utilize as tags abaixo para que o sistema substitua automaticamente pelos dados do serviço:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-white border border-slate-200 text-slate-700 select-all">{`{cliente}`}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-white border border-slate-200 text-slate-700 select-all">{`{servico}`}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-white border border-slate-200 text-slate-700 select-all">{`{empresa}`}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-white border border-slate-200 text-slate-700 select-all">{`{etapa}`}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-white border border-slate-200 text-slate-700 select-all">{`{responsavel}`}</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Avisar Etapa */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Avisar Avanço de Etapa (Cliente)</label>
                  <textarea
                    value={editingTemplates.avisar_etapa}
                    onChange={(e) => setEditingTemplates({ ...editingTemplates, avisar_etapa: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-emerald min-h-[70px] leading-relaxed"
                  />
                </div>

                {/* Cobrar Empresa */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cobrar Etapa / Alerta (Empresa Parceira)</label>
                  <textarea
                    value={editingTemplates.cobrar_empresa}
                    onChange={(e) => setEditingTemplates({ ...editingTemplates, cobrar_empresa: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-emerald min-h-[70px] leading-relaxed"
                  />
                </div>

                {/* Cobrar Cliente */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cobrar Retorno / Alerta (Cliente)</label>
                  <textarea
                    value={editingTemplates.cobrar_cliente}
                    onChange={(e) => setEditingTemplates({ ...editingTemplates, cobrar_cliente: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-emerald min-h-[70px] leading-relaxed"
                  />
                </div>

                {/* Avisar Conclusão */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Avisar Finalização (Cliente)</label>
                  <textarea
                    value={editingTemplates.avisar_conclusao}
                    onChange={(e) => setEditingTemplates({ ...editingTemplates, avisar_conclusao: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-emerald min-h-[70px] leading-relaxed"
                  />
                </div>

                {/* Feedback */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Feedback de Finalização (Cliente)</label>
                  <textarea
                    value={editingTemplates.feedback}
                    onChange={(e) => setEditingTemplates({ ...editingTemplates, feedback: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-emerald min-h-[70px] leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button" 
                onClick={() => setIsTemplatesModalOpen(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={async () => {
                  try {
                    setSaving(true);
                    const res = await saveSiteSettingsAction('tracking_templates', editingTemplates);
                    if (res.success) {
                      setTemplates(editingTemplates);
                      setIsTemplatesModalOpen(false);
                      showSuccess('Frases configuradas salvas com sucesso!');
                    } else {
                      throw new Error(res.error);
                    }
                  } catch (err: any) {
                    alert(err.message || 'Erro ao salvar os modelos de mensagem.');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Salvar Frases
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
