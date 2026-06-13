"use client";

import React, { useEffect, useState } from 'react';
import { Company } from '@/types';
import { getCompaniesAction, saveCompanyAction, deleteCompanyAction } from '@/app/actions/companies';
import { uploadSiteImageAction } from '@/app/actions/settings';
import { servicesConfig } from '@/config/services';
import { 
  Building, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Edit3, 
  Star, 
  Check, 
  Loader2, 
  X, 
  Upload, 
  Phone, 
  Mail, 
  MapPin, 
  Award,
  AlertCircle
} from 'lucide-react';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [serviceFilter, setServiceFilter] = useState('Todos');

  // Modal de edição / cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await getCompaniesAction();
      if (res.success && res.data) {
        setCompanies(res.data);
      } else {
        throw new Error(res.error || 'Erro desconhecido ao carregar.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erro ao buscar empresas homologadas.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCompany({
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      nome_fantasia: '',
      razao_social: '',
      cnpj: '',
      email: '',
      telefone: '',
      whatsapp: '',
      cidade: '',
      estado: 'SC',
      endereco: '',
      responsavel_nome: '',
      status: 'Ativo',
      servicos: [],
      score: 80,
      rating: 4.5,
      projetos_concluidos: 0,
      observacoes: '',
      logo_url: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (company: Company) => {
    setEditingCompany({ ...company });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover esta empresa do hub?')) return;

    try {
      setSaving(true);
      const res = await deleteCompanyAction(id);
      if (res.success) {
        showSuccess('Empresa removida com sucesso!');
        fetchCompanies();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao remover empresa.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    if (!editingCompany.nome_fantasia.trim()) {
      alert('O Nome Fantasia é obrigatório!');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      const res = await saveCompanyAction(editingCompany);
      if (res.success) {
        showSuccess('Empresa salva com sucesso!');
        setIsModalOpen(false);
        setEditingCompany(null);
        fetchCompanies();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar a empresa.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCompany) return;

    try {
      setUploadingLogo(true);
      setErrorMsg('');

      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadSiteImageAction(formData);
      if (res.success && res.url) {
        setEditingCompany({ ...editingCompany, logo_url: res.url });
      } else {
        throw new Error(res.error || 'Erro ao fazer upload da imagem.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar logotipo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const toggleServiceCheckbox = (serviceId: string) => {
    if (!editingCompany) return;
    const currentServices = [...editingCompany.servicos];
    const idx = currentServices.indexOf(serviceId);

    if (idx >= 0) {
      currentServices.splice(idx, 1);
    } else {
      currentServices.push(serviceId);
    }

    setEditingCompany({ ...editingCompany, servicos: currentServices });
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Filtragem local
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.razao_social && c.razao_social.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.cnpj && c.cnpj.includes(searchTerm)) ||
      (c.cidade && c.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.responsavel_nome && c.responsavel_nome.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
    
    const matchesService = serviceFilter === 'Todos' || c.servicos.includes(serviceFilter);

    return matchesSearch && matchesStatus && matchesService;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Inativo': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Pendente': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Bloqueado': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-brand-emerald';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

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
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
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
              placeholder="Buscar por nome, CNPJ, cidade..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
            />
          </div>

          {/* Filtro de Status */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs border border-slate-200 rounded-md focus:outline-none bg-white font-medium text-slate-600"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Pendente">Pendente</option>
            <option value="Bloqueado">Bloqueado</option>
          </select>

          {/* Filtro de Serviço */}
          <select 
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="py-2 px-3 text-xs border border-slate-200 rounded-md focus:outline-none bg-white font-medium text-slate-600"
          >
            <option value="Todos">Todos os Serviços</option>
            {servicesConfig.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="bg-brand-emerald text-white px-3 py-2 rounded-md text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Empresa
        </button>
      </div>

      {/* Lista / Tabela */}
      {loading ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 shadow-sm text-center">
          <Loader2 className="w-8 h-8 text-brand-emerald animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-xs">Carregando lista de empresas homologadas...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400 text-xs italic">
          Nenhuma empresa homologada cadastrada ou compatível com os filtros atuais.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/85 text-slate-500 text-[10px] uppercase tracking-[0.1em] border-b border-slate-200">
                  <th className="px-6 py-4 font-bold">Empresa / Logo</th>
                  <th className="px-6 py-4 font-bold">Contato</th>
                  <th className="px-6 py-4 font-bold">Cidade</th>
                  <th className="px-6 py-4 font-bold text-center">Projetos</th>
                  <th className="px-6 py-4 font-bold">Pontuação &amp; Score</th>
                  <th className="px-6 py-4 font-bold">Serviços Prestados</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Empresa / Logo */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {company.logo_url ? (
                            <img src={company.logo_url} alt={company.nome_fantasia} className="w-full h-full object-contain" />
                          ) : (
                            <Building className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                            {company.nome_fantasia}
                            {company.score >= 90 && (
                              <span title="Excelência Premium">
                                <Award className="w-3.5 h-3.5 text-brand-orange" />
                              </span>
                            )}
                          </div>
                          {company.razao_social && (
                            <div className="text-[10px] text-slate-400 mt-0.5 max-w-[180px] truncate" title={company.razao_social}>
                              {company.razao_social}
                            </div>
                          )}
                          {company.cnpj && (
                            <div className="text-[9px] font-mono text-slate-400">
                              CNPJ: {company.cnpj}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contato */}
                    <td className="px-6 py-4 space-y-1">
                      {company.responsavel_nome && (
                        <div className="font-semibold text-slate-700">{company.responsavel_nome}</div>
                      )}
                      <div className="text-[10px] text-slate-500 flex flex-col gap-0.5">
                        {company.whatsapp && (
                          <span className="flex items-center gap-1">
                            <span className="text-emerald-500">📱</span> {company.whatsapp}
                          </span>
                        )}
                        {company.email && (
                          <span className="flex items-center gap-1 truncate max-w-[160px]" title={company.email}>
                            <span className="text-slate-400">📧</span> {company.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cidade */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{company.cidade}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{company.estado}</div>
                    </td>

                    {/* Projetos */}
                    <td className="px-6 py-4 text-center font-bold text-slate-800 font-mono">
                      {company.projetos_concluidos || 0}
                    </td>

                    {/* Pontuação & Score */}
                    <td className="px-6 py-4 space-y-1.5">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-slate-700">{Number(company.rating).toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400">/5</span>
                      </div>

                      {/* Score Bar */}
                      <div className="w-28 space-y-0.5">
                        <div className="flex justify-between text-[9px] font-bold text-slate-500">
                          <span>Quality Score</span>
                          <span>{company.score} pts</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getScoreColor(company.score)} rounded-full`} 
                            style={{ width: `${company.score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Serviços */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {company.servicos.length === 0 ? (
                          <span className="text-[9px] italic text-slate-400">Nenhum selecionado</span>
                        ) : (
                          company.servicos.map(sId => {
                            const name = servicesConfig.find(sc => sc.id === sId)?.title || sId;
                            return (
                              <span 
                                key={sId} 
                                className="px-1.5 py-0.5 rounded text-[8px] bg-slate-100 text-slate-600 border border-slate-200/50 font-bold truncate max-w-[90px]"
                                title={name}
                              >
                                {name}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getStatusBadgeClass(company.status)}`}>
                        {company.status}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(company)}
                          className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:text-brand-emerald hover:bg-slate-50 transition-all cursor-pointer"
                          title="Editar Cadastro"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="p-1.5 rounded border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          title="Remover Empresa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR / EDITAR */}
      {isModalOpen && editingCompany && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-emerald/10 text-brand-emerald rounded-lg">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingCompany.id && companies.some(c => c.id === editingCompany.id) ? 'Editar Empresa Homologada' : 'Cadastrar Nova Empresa'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Insira todos os dados cadastrais e avaliações para homologação.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Seção 1: Imagem / Logotipo */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 relative overflow-hidden flex-shrink-0">
                  {uploadingLogo ? (
                    <Loader2 className="w-5 h-5 text-brand-emerald animate-spin" />
                  ) : editingCompany.logo_url ? (
                    <img src={editingCompany.logo_url} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <Building className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="text-center sm:text-left space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logotipo da Empresa</span>
                  <div className="flex items-center gap-2">
                    <label className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5" /> Enviar Logotipo
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoUpload}
                      />
                    </label>
                    {editingCompany.logo_url && (
                      <button 
                        type="button"
                        onClick={() => setEditingCompany({ ...editingCompany, logo_url: '' })}
                        className="text-[9px] font-bold text-red-500 hover:text-red-700 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-md hover:bg-red-100 transition-all"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção 2: Dados Principais */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Identificação e Status</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nome Fantasia *</label>
                    <input 
                      type="text" 
                      required
                      value={editingCompany.nome_fantasia}
                      onChange={(e) => setEditingCompany({ ...editingCompany, nome_fantasia: e.target.value })}
                      placeholder="Ex: Elite Solar SC"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Razão Social</label>
                    <input 
                      type="text" 
                      value={editingCompany.razao_social || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, razao_social: e.target.value })}
                      placeholder="Ex: Elite Solar e Tecnologia Ltda"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">CNPJ</label>
                    <input 
                      type="text" 
                      value={editingCompany.cnpj || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                    <select 
                      value={editingCompany.status}
                      onChange={(e) => setEditingCompany({ ...editingCompany, status: e.target.value as any })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-emerald"
                    >
                      <option value="Ativo">Ativo (Homologado)</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Pendente">Pendente (Análise técnica)</option>
                      <option value="Bloqueado">Bloqueado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 3: Contatos e Endereço */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Contatos e Localização</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Responsável Técnico/Vendas</label>
                    <input 
                      type="text" 
                      value={editingCompany.responsavel_nome || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, responsavel_nome: e.target.value })}
                      placeholder="Ex: Eng. Rodrigo Silva"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">WhatsApp</label>
                    <input 
                      type="text" 
                      value={editingCompany.whatsapp || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, whatsapp: e.target.value })}
                      placeholder="Ex: (48) 99999-9999"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Telefone</label>
                    <input 
                      type="text" 
                      value={editingCompany.telefone || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, telefone: e.target.value })}
                      placeholder="Ex: (48) 3333-3333"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">E-mail</label>
                    <input 
                      type="email" 
                      value={editingCompany.email || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
                      placeholder="contato@empresa.com.br"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Cidade / Estado</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Cidade"
                        value={editingCompany.cidade}
                        onChange={(e) => setEditingCompany({ ...editingCompany, cidade: e.target.value })}
                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-md focus:outline-none"
                      />
                      <input 
                        type="text" 
                        maxLength={2}
                        placeholder="UF"
                        value={editingCompany.estado}
                        onChange={(e) => setEditingCompany({ ...editingCompany, estado: e.target.value.toUpperCase() })}
                        className="w-12 text-xs text-center border border-slate-200 rounded-md focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Endereço Completo</label>
                  <input 
                    type="text" 
                    value={editingCompany.endereco || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, endereco: e.target.value })}
                    placeholder="Rua, Número, Bairro, CEP"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              {/* Seção 4: Serviços Prestados */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Serviços Prestados</h4>
                <p className="text-[10px] text-slate-400">Selecione todos os serviços que esta empresa está autorizada a realizar através do Hubly Pro.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                  {servicesConfig.map(s => {
                    const isChecked = editingCompany.servicos.includes(s.id);
                    return (
                      <label 
                        key={s.id} 
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-brand-emerald/5 border-brand-emerald/40 text-brand-navy font-bold' 
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleServiceCheckbox(s.id)}
                          className="w-3.5 h-3.5 text-brand-emerald border-slate-300 rounded focus:ring-brand-emerald cursor-pointer"
                        />
                        <span className="text-xs">{s.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Seção 5: Score e Desempenho */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Auditoria e Desempenho (Pontuação)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Qualidade (Score)</label>
                      <span className="text-[10px] font-bold text-brand-emerald">{editingCompany.score} / 100</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100"
                      value={editingCompany.score}
                      onChange={(e) => setEditingCompany({ ...editingCompany, score: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-emerald"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Avaliação (1 a 5 estrelas)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        min="0" 
                        max="5" 
                        step="0.1"
                        value={editingCompany.rating}
                        onChange={(e) => setEditingCompany({ ...editingCompany, rating: parseFloat(e.target.value) })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none"
                      />
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Projetos Concluídos</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={editingCompany.projetos_concluidos}
                      onChange={(e) => setEditingCompany({ ...editingCompany, projetos_concluidos: parseInt(e.target.value) })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 6: Observações Internas */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Observações e Informações Adicionais</label>
                <textarea 
                  value={editingCompany.observacoes || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, observacoes: e.target.value })}
                  placeholder="Insira detalhes sobre a auditoria técnica, parcerias, condições especiais negociadas ou restrições."
                  className="w-full text-xs p-3 border border-slate-200 rounded-md focus:outline-none min-h-[80px]"
                />
              </div>
            </form>

            {/* Footer Modal */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Salvar Empresa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
