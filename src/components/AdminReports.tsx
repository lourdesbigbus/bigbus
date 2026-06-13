"use client";

import React, { useEffect, useState } from 'react';
import { getLeadsAction } from '@/app/actions/leads';
import { getCompaniesAction } from '@/app/actions/companies';
import { getTrackingsAction } from '@/app/actions/trackings';
import { 
  getGoogleDriveConfigAction, 
  saveGoogleDriveConfigAction, 
  syncAllToGoogleDriveAction,
  GoogleDriveConfig
} from '@/app/actions/drive';
import { 
  BarChart, 
  Download, 
  CloudLightning, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  FolderOpen,
  Mail,
  Key,
  Folder,
  HelpCircle,
  Users,
  Building,
  ClipboardList
} from 'lucide-react';

export default function AdminReports() {
  const [counts, setCounts] = useState({ leads: 0, companies: 0, trackings: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Google Drive Config States
  const [driveConfig, setDriveConfig] = useState<GoogleDriveConfig>({
    client_email: '',
    private_key: '',
    folder_id: ''
  });
  const [hasPrivateKey, setHasPrivateKey] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Sync States
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; msg: string; files?: string[] } | null>(null);

  useEffect(() => {
    fetchStatsAndConfig();
  }, []);

  const fetchStatsAndConfig = async () => {
    try {
      setLoadingStats(true);
      const [leadsRes, compRes, trackRes, driveRes] = await Promise.all([
        getLeadsAction(),
        getCompaniesAction(),
        getTrackingsAction(),
        getGoogleDriveConfigAction()
      ]);

      setCounts({
        leads: leadsRes.success ? (leadsRes.data?.length || 0) : 0,
        companies: compRes.success ? (compRes.data?.length || 0) : 0,
        trackings: trackRes.success ? (trackRes.data?.length || 0) : 0
      });

      if (driveRes.success && driveRes.data) {
        setDriveConfig({
          client_email: driveRes.data.client_email || '',
          private_key: driveRes.data.has_private_key ? '********' : '',
          folder_id: driveRes.data.folder_id || ''
        });
        setHasPrivateKey(!!driveRes.data.has_private_key);
      }
    } catch (err) {
      console.error('Erro ao buscar dados iniciais de relatórios:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const convertToCSVString = (headers: string[], rows: any[][]): string => {
    const escapeCell = (val: any) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      str = str.replace(/"/g, '""');
      if (str.includes(';') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
        return `"${str}"`;
      }
      return str;
    };

    const headerLine = headers.join(';');
    const rowLines = rows.map(row => row.map(escapeCell).join(';'));
    return [headerLine, ...rowLines].join('\r\n');
  };

  const triggerCSVDownload = (name: string, headers: string[], rows: any[][]) => {
    const csvContent = convertToCSVString(headers, rows);
    // Adiciona o UTF-8 BOM (\ufeff) para o Excel reconhecer acentuação pt-BR automaticamente
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hubly_${name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Downloads Individuais
  const handleDownloadLeads = async () => {
    try {
      const res = await getLeadsAction();
      if (!res.success || !res.data) throw new Error(res.error || 'Erro ao carregar leads.');

      const headers = [
        'Data de Entrada', 'Nome', 'WhatsApp', 'E-mail', 'Localizacao', 'CEP', 
        'Concessionaria', 'Servico', 'Status', 'Prioridade/Temperatura', 
        'Valor Proposta (R$)', 'Valor Fechado (R$)', 'Valor Conta Luz (R$)', 
        'Perda Estimada (R$)', 'Motivo da Perda', 'Data Proximo Contato', 
        'Origem', 'Observacoes'
      ];
      const rows = res.data.map(l => [
        l.created_at ? new Date(l.created_at).toLocaleString('pt-BR') : '',
        l.nome || '',
        l.whatsapp || '',
        l.email || '',
        l.localizacao || '',
        l.cep || '',
        l.concessionaria || '',
        l.servico || '',
        l.status || 'Pendente',
        l.temperatura || 'Morno',
        l.valor_proposta || 0,
        l.valor_fechado || 0,
        l.valor_conta || 0,
        l.perda_estimada || 0,
        l.motivo_perda || '',
        l.data_proximo_contato || '',
        l.origem || 'Landing Page',
        l.observacoes || ''
      ]);

      triggerCSVDownload('clientes', headers, rows);
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar clientes.');
    }
  };

  const handleDownloadCompanies = async () => {
    try {
      const res = await getCompaniesAction();
      if (!res.success || !res.data) throw new Error(res.error || 'Erro ao carregar empresas.');

      const headers = [
        'Data de Homologacao', 'Nome Fantasia', 'Razao Social', 'CNPJ', 'E-mail', 
        'Telefone', 'WhatsApp', 'Cidade', 'Estado', 'Endereco', 
        'Responsavel Nome', 'Status', 'Qualidade (Score)', 'Avaliacao (Rating)', 
        'Projetos Concluidos', 'Servicos Prestados', 'Observacoes'
      ];
      const rows = res.data.map(c => [
        c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '',
        c.nome_fantasia || '',
        c.razao_social || '',
        c.cnpj || '',
        c.email || '',
        c.telefone || '',
        c.whatsapp || '',
        c.cidade || '',
        c.estado || '',
        c.endereco || '',
        c.responsavel_nome || '',
        c.status || 'Ativo',
        c.score || 0,
        c.rating || 0,
        c.projetos_concluidos || 0,
        Array.isArray(c.servicos) ? c.servicos.join(', ') : '',
        c.observacoes || ''
      ]);

      triggerCSVDownload('empresas', headers, rows);
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar empresas.');
    }
  };

  const handleDownloadTrackings = async () => {
    try {
      const res = await getTrackingsAction();
      if (!res.success || !res.data) throw new Error(res.error || 'Erro ao carregar acompanhamentos.');

      const headers = [
        'Data de Criacao', 'Nome do Cliente', 'WhatsApp do Cliente', 'E-mail do Cliente', 
        'Servico Contratado', 'Nome da Empresa Parceira', 'WhatsApp da Empresa', 
        'Etapa Atual', 'Data de Inicio', 'Previsao de Entrega', 'Observacoes'
      ];
      const rows = res.data.map(t => [
        t.created_at ? new Date(t.created_at).toLocaleDateString('pt-BR') : '',
        t.cliente_nome || '',
        t.cliente_whatsapp || '',
        t.cliente_email || '',
        t.servico || '',
        t.empresa_nome || '',
        t.empresa_whatsapp || '',
        t.etapa || '',
        t.data_inicio || '',
        t.data_previsao || '',
        t.observacoes || ''
      ]);

      triggerCSVDownload('servicos', headers, rows);
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar serviços.');
    }
  };

  // Salvar Configuração Drive
  const handleSaveDriveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    setSaveLoading(true);

    try {
      const res = await saveGoogleDriveConfigAction(driveConfig);
      if (res.success) {
        setSaveStatus({ type: 'success', msg: 'Configurações salvas com sucesso!' });
        if (driveConfig.private_key && driveConfig.private_key !== '********') {
          setHasPrivateKey(true);
          setDriveConfig(prev => ({ ...prev, private_key: '********' }));
        }
      } else {
        throw new Error(res.error || 'Erro ao salvar credenciais.');
      }
    } catch (err: any) {
      setSaveStatus({ type: 'error', msg: err.message || 'Erro ao salvar configurações.' });
    } finally {
      setSaveLoading(false);
    }
  };

  // Sincronizar Tudo com o Drive
  const handleSyncToDrive = async () => {
    setSyncStatus(null);
    setSyncLoading(true);

    try {
      const res = await syncAllToGoogleDriveAction();
      if (res.success && res.data) {
        setSyncStatus({ 
          type: 'success', 
          msg: 'Sincronização concluída! Os 3 arquivos foram enviados ao Google Drive.',
          files: res.data 
        });
      } else {
        throw new Error(res.error || 'Erro durante a sincronização.');
      }
    } catch (err: any) {
      setSyncStatus({ 
        type: 'error', 
        msg: err.message || 'Falha ao sincronizar arquivos com o Google Drive.' 
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cards de Exportação Local */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Exportação Local de Planilhas</h2>
          <p className="text-xs text-slate-500">Baixe os dados cadastrados diretamente no seu computador em formato CSV (compatível com Excel).</p>
        </div>

        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-36" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Clientes */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Planilha de Clientes</span>
                  <h3 className="text-base font-black text-slate-900">Clientes & Leads</h3>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{counts.leads} registros</span>
                <button 
                  onClick={handleDownloadLeads}
                  className="bg-brand-emerald hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar
                </button>
              </div>
            </div>

            {/* Empresas */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Planilha de Empresas</span>
                  <h3 className="text-base font-black text-slate-900">Parceiros Homologados</h3>
                </div>
                <div className="p-2.5 bg-orange-50 text-brand-orange rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{counts.companies} registros</span>
                <button 
                  onClick={handleDownloadCompanies}
                  className="bg-brand-emerald hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar
                </button>
              </div>
            </div>

            {/* Serviços */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Planilha de Serviços</span>
                  <h3 className="text-base font-black text-slate-900">Acompanhamentos</h3>
                </div>
                <div className="p-2.5 bg-purple-50 text-purple-500 rounded-xl">
                  <ClipboardList className="w-5 h-5" />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{counts.trackings} registros</span>
                <button 
                  onClick={handleDownloadTrackings}
                  className="bg-brand-emerald hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sincronização Google Drive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-slate-200">
        
        {/* Lado Esquerdo: Instruções e Sincronização */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Sincronização em Nuvem</h2>
            <p className="text-xs text-slate-500 mt-1">Envie as 3 planilhas de forma integrada para o Google Drive da sua conta mestra.</p>
          </div>

          <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-brand-emerald font-black text-xs uppercase tracking-wider">
              <CloudLightning className="w-4 h-4" />
              Integração Ativa
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Utilizamos a API Oficial do Google Drive. Os arquivos serão enviados diretamente para a pasta indicada através de uma Conta de Serviço (Service Account).
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                Como configurar:
              </h4>
              <ol className="text-[10px] text-slate-400 space-y-2 list-decimal list-inside leading-relaxed pl-0.5 font-medium">
                <li>Crie um projeto no Google Cloud Console.</li>
                <li>Ative a API do Google Drive e crie uma Conta de Serviço com chave JSON.</li>
                <li>Cole o e-mail da conta de serviço e a chave privada (Private Key) no formulário ao lado.</li>
                <li>Crie uma pasta no seu Google Drive pessoal e **compartilhe ela com acesso de editor** para o e-mail da Conta de Serviço.</li>
                <li>Copie o ID dessa pasta (presente na URL da pasta no navegador) e cole no campo "ID da Pasta".</li>
              </ol>
            </div>

            {hasPrivateKey && (
              <button
                type="button"
                onClick={handleSyncToDrive}
                disabled={syncLoading}
                className="w-full bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                {syncLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Enviando Planilhas...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Sincronizar Planilhas Agora
                  </>
                )}
              </button>
            )}

            {syncStatus && (
              <div className={`p-4 rounded-xl text-xs leading-relaxed space-y-2 border ${
                syncStatus.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50' : 'bg-red-950/40 text-red-300 border-red-900/50'
              }`}>
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]">
                  {syncStatus.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                  <span>{syncStatus.type === 'success' ? 'Sincronização OK' : 'Falha na Sincronização'}</span>
                </div>
                <p>{syncStatus.msg}</p>
                {syncStatus.files && (
                  <div className="font-mono text-[9px] text-slate-400 pt-1 border-t border-slate-800/40 space-y-1">
                    {syncStatus.files.map(f => (
                      <div key={f} className="flex items-center gap-1">
                        <FolderOpen className="w-3 h-3 text-brand-emerald" /> {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Formulário de Credenciais */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-slate-100 bg-slate-50/20">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Folder className="w-4 h-4 text-brand-emerald" />
                Configurar Credenciais do Google Drive
              </h3>
              <p className="text-xs text-slate-500 mt-1">Insira os dados da conta de serviço cadastrada no Google Cloud Console.</p>
            </div>

            <form onSubmit={handleSaveDriveConfig} className="p-6 space-y-4">
              {/* E-mail da conta de serviço */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">E-mail da Conta de Serviço</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={driveConfig.client_email}
                    onChange={(e) => setDriveConfig(prev => ({ ...prev, client_email: e.target.value }))}
                    placeholder="ex: hubly-drive@projeto.iam.gserviceaccount.com"
                    className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>

              {/* ID da pasta de destino */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">ID da Pasta no Google Drive</label>
                <div className="relative">
                  <FolderOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={driveConfig.folder_id}
                    onChange={(e) => setDriveConfig(prev => ({ ...prev, folder_id: e.target.value }))}
                    placeholder="ex: 1A2b3C4d5E6f7G8h9I0jKLMnOpQrStUvW"
                    className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>

              {/* Chave Privada (Private Key) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                  <span>Chave Privada (Private Key)</span>
                  {hasPrivateKey && <span className="text-brand-emerald font-bold lowercase">Chave Salva ✔</span>}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    required
                    rows={4}
                    value={driveConfig.private_key}
                    onChange={(e) => setDriveConfig(prev => ({ ...prev, private_key: e.target.value }))}
                    placeholder="Cole todo o bloco -----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----"
                    className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald font-mono leading-relaxed"
                  />
                </div>
              </div>

              {saveStatus && (
                <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 font-semibold ${
                  saveStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {saveStatus.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                  <span>{saveStatus.msg}</span>
                </div>
              )}
            </form>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              onClick={handleSaveDriveConfig}
              disabled={saveLoading}
              className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              {saveLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              Salvar Credenciais
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
