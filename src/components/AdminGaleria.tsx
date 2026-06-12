"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { GaleriaItem } from '@/types';
import {
  getGaleriaAdminAction, createGaleriaItemAction, updateGaleriaItemAction,
  toggleGaleriaAtivoAction, deleteGaleriaItemAction
} from '@/app/actions/galeria';
import { Plus, Image as ImageIcon, MessageSquareQuote, Star, Eye, EyeOff, Trash2, Edit3, X, Save, Check, AlertCircle, ExternalLink } from 'lucide-react';

const SERVICOS = [
  { value: 'geral',                     label: '🌐 Geral (aparece na home e em todas as páginas)' },
  { value: 'Limpeza Técnica de Placas', label: '🧹 Limpeza Técnica de Placas' },
  { value: 'Energia Solar',             label: '☀️ Energia Solar' },
  { value: 'Aquecimento de Piso',       label: '🔥 Aquecimento de Piso' },
  { value: 'Automação Residencial',     label: '🏠 Automação Residencial' },
  { value: 'Ar Condicionado',           label: '❄️ Ar Condicionado' },
  { value: 'Controle de Acesso',        label: '🔒 Controle de Acesso' },
  { value: 'Carregamento Veicular',     label: '⚡ Carregamento Veicular' },
];

const DEFAULT_FORM: Omit<GaleriaItem, 'id' | 'created_at'> = {
  tipo: 'ambos',
  servico: 'geral',
  cliente_nome: '',
  cliente_cidade: '',
  avaliacao: 5,
  texto: '',
  foto_url: '',
  ativo: true,
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="focus:outline-none"
        >
          <Star className={`w-5 h-5 transition-colors ${s <= (hovered || value) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
        </button>
      ))}
    </div>
  );
}

export default function AdminGaleria() {
  const [items, setItems]           = useState<GaleriaItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [activeTab, setActiveTab]   = useState<'todos' | 'fotos' | 'depoimentos'>('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GaleriaItem | null>(null);
  const [form, setForm]             = useState(DEFAULT_FORM);
  const [saving, setSaving]         = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [filterServico, setFilterServico] = useState('todos');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await getGaleriaAdminAction();
    if (res.success) setItems(res.data || []);
    else setError(res.error || 'Erro ao carregar galeria.');
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditingItem(null);
    setForm(DEFAULT_FORM);
    setPreviewError(false);
    setIsFormOpen(true);
  };

  const openEdit = (item: GaleriaItem) => {
    setEditingItem(item);
    setForm({
      tipo: item.tipo, servico: item.servico, cliente_nome: item.cliente_nome,
      cliente_cidade: item.cliente_cidade || '', avaliacao: item.avaliacao,
      texto: item.texto || '', foto_url: item.foto_url || '', ativo: item.ativo,
    });
    setPreviewError(false);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.cliente_nome.trim()) { alert('Nome do cliente é obrigatório.'); return; }
    if (form.tipo !== 'foto' && !form.texto?.trim()) { alert('O texto do depoimento é obrigatório.'); return; }
    if (form.tipo !== 'depoimento' && !form.foto_url?.trim()) { alert('A URL da foto é obrigatória.'); return; }
    setSaving(true);
    try {
      let res;
      if (editingItem) {
        res = await updateGaleriaItemAction({ ...editingItem, ...form });
      } else {
        res = await createGaleriaItemAction(form);
      }
      if (!res.success) throw new Error(res.error);
      await fetchItems();
      setIsFormOpen(false);
    } catch (e: any) {
      alert(e.message || 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  const handleToggle = async (item: GaleriaItem) => {
    await toggleGaleriaAtivoAction(item.id, !item.ativo);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, ativo: !i.ativo } : i));
  };

  const handleDelete = async (item: GaleriaItem) => {
    if (!confirm(`Excluir permanentemente o item de "${item.cliente_nome}"?`)) return;
    await deleteGaleriaItemAction(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  };

  const filteredItems = items.filter(i => {
    if (activeTab === 'fotos') return i.tipo === 'foto' || i.tipo === 'ambos';
    if (activeTab === 'depoimentos') return i.tipo === 'depoimento' || i.tipo === 'ambos';
    return true;
  }).filter(i => filterServico === 'todos' || i.servico === filterServico);

  const inputCls = "w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white text-slate-800";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 mt-0.5">Gerencie fotos e depoimentos que aparecem no site público.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-brand-emerald text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Adicionar Item
        </button>
      </div>

      {/* Aviso SQL */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-blue-800 mb-1">Antes de usar: crie a tabela no Supabase</p>
          <p className="text-[11px] text-blue-700 font-mono bg-blue-100 rounded px-2 py-1">
            CREATE TABLE galeria (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT NOW(), tipo TEXT, servico TEXT DEFAULT 'geral', cliente_nome TEXT, cliente_cidade TEXT, avaliacao INTEGER DEFAULT 5, texto TEXT, foto_url TEXT, ativo BOOLEAN DEFAULT TRUE);
          </p>
        </div>
      </div>

      {/* Tabs + Filtro */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
          {(['todos','fotos','depoimentos'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${activeTab === tab ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
              {tab === 'todos' ? 'Todos' : tab === 'fotos' ? '📷 Fotos' : '💬 Depoimentos'}
            </button>
          ))}
        </div>
        <select value={filterServico} onChange={e => setFilterServico(e.target.value)}
          className="py-2 px-2.5 text-xs border border-slate-200 rounded-lg bg-white font-medium text-slate-600 focus:outline-none focus:border-emerald-500">
          <option value="todos">Todos os serviços</option>
          {SERVICOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filteredItems.length} itens</span>
      </div>

      {/* Grid de itens */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Carregando galeria...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-500 text-sm bg-red-50 rounded-xl border border-red-100 p-8">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-bold">Erro ao carregar</p>
          <p className="text-xs mt-1">{error}</p>
          <p className="text-xs text-red-400 mt-2">Verifique se a tabela "galeria" foi criada no Supabase.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 text-sm font-bold">Nenhum item cadastrado ainda</p>
          <p className="text-slate-400 text-xs mt-1">Clique em "Adicionar Item" para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className={`bg-white rounded-xl border ${item.ativo ? 'border-slate-200' : 'border-slate-100 opacity-60'} shadow-sm overflow-hidden transition-all hover:shadow-md`}>
              {/* Foto */}
              {item.foto_url && (
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={item.foto_url}
                    alt={`Foto de ${item.cliente_nome}`}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/e2e8f0/94a3b8?text=Foto+indisponível'; }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${item.tipo === 'foto' ? 'bg-blue-100 text-blue-700 border-blue-200' : item.tipo === 'depoimento' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                      {item.tipo === 'ambos' ? '📷+💬' : item.tipo === 'foto' ? '📷 Foto' : '💬 Dep.'}
                    </span>
                  </div>
                </div>
              )}
              {!item.foto_url && (
                <div className="h-20 bg-slate-50 flex items-center justify-center border-b border-slate-100">
                  <MessageSquareQuote className="w-8 h-8 text-slate-200" />
                </div>
              )}

              {/* Conteúdo */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">{item.cliente_nome}</p>
                    {item.cliente_cidade && <p className="text-[10px] text-slate-400">{item.cliente_cidade}</p>}
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3 h-3 ${s <= item.avaliacao ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>

                {item.texto && (
                  <p className="text-[11px] text-slate-500 italic leading-relaxed line-clamp-3">"{item.texto}"</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                    {SERVICOS.find(s => s.value === item.servico)?.label.split(' ').slice(1).join(' ') || item.servico}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleToggle(item)} title={item.ativo ? 'Desativar' : 'Ativar'}
                      className={`p-1.5 rounded-lg border transition-all ${item.ativo ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'}`}>
                      {item.ativo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => openEdit(item)} title="Editar"
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item)} title="Excluir"
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <h2 className="text-base font-black text-slate-800">
                {editingItem ? 'Editar Item da Galeria' : 'Adicionar Foto / Depoimento'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Tipo */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Tipo de conteúdo</label>
                <div className="flex gap-2">
                  {[
                    { v: 'ambos',      icon: '📷+💬', label: 'Foto + Depoimento' },
                    { v: 'foto',       icon: '📷',    label: 'Só Foto' },
                    { v: 'depoimento', icon: '💬',    label: 'Só Depoimento' },
                  ].map(opt => (
                    <button key={opt.v} type="button"
                      onClick={() => setForm(f => ({ ...f, tipo: opt.v as any }))}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${form.tipo === opt.v ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Serviço */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Serviço (onde vai aparecer)</label>
                <select value={form.servico} onChange={e => setForm(f => ({ ...f, servico: e.target.value }))} className={inputCls}>
                  {SERVICOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Cliente */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nome do Cliente *</label>
                  <input type="text" className={inputCls} placeholder="Ex: João Silva"
                    value={form.cliente_nome} onChange={e => setForm(f => ({ ...f, cliente_nome: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Cidade</label>
                  <input type="text" className={inputCls} placeholder="Ex: Florianópolis, SC"
                    value={form.cliente_cidade || ''} onChange={e => setForm(f => ({ ...f, cliente_cidade: e.target.value }))} />
                </div>
              </div>

              {/* Avaliação */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Avaliação</label>
                <StarRating value={form.avaliacao} onChange={v => setForm(f => ({ ...f, avaliacao: v }))} />
              </div>

              {/* URL da Foto */}
              {(form.tipo === 'foto' || form.tipo === 'ambos') && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    URL da Foto *
                    <span className="text-slate-400 font-normal normal-case ml-1">(cole o link da imagem — Google Drive, ImgBB, Cloudinary...)</span>
                  </label>
                  <div className="relative">
                    <input type="url" className={inputCls + " pr-10"} placeholder="https://..."
                      value={form.foto_url || ''}
                      onChange={e => { setForm(f => ({ ...f, foto_url: e.target.value })); setPreviewError(false); }} />
                    {form.foto_url && (
                      <a href={form.foto_url} target="_blank" rel="noreferrer" className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {/* Preview da imagem */}
                  {form.foto_url && !previewError && (
                    <div className="mt-2 relative h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                      <img src={form.foto_url} alt="Preview"
                        className="w-full h-full object-cover"
                        onLoad={() => setPreviewError(false)}
                        onError={() => setPreviewError(true)} />
                    </div>
                  )}
                  {previewError && (
                    <div className="mt-2 h-16 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center text-xs text-red-500 font-medium">
                      ⚠ URL inválida ou imagem não carregou. Verifique o link.
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    💡 Para Google Drive: abra a foto, clique em "Compartilhar" → "Qualquer pessoa com o link" → copie e use o formato: <code className="bg-slate-100 px-1 rounded">https://drive.google.com/uc?id=ID_DO_ARQUIVO</code>
                  </p>
                </div>
              )}

              {/* Texto do Depoimento */}
              {(form.tipo === 'depoimento' || form.tipo === 'ambos') && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Texto do Depoimento *</label>
                  <textarea className={inputCls + " resize-none min-h-[100px]"}
                    placeholder="Ex: Serviço excelente! A equipe foi muito profissional e o resultado superou as expectativas..."
                    value={form.texto || ''}
                    onChange={e => setForm(f => ({ ...f, texto: e.target.value }))} />
                  <p className="text-[10px] text-slate-400 mt-1">{(form.texto || '').length} caracteres</p>
                </div>
              )}

              {/* Ativo */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <button type="button" onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.ativo ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <div>
                  <p className="text-xs font-bold text-slate-700">{form.ativo ? 'Visível no site' : 'Oculto no site'}</p>
                  <p className="text-[10px] text-slate-400">{form.ativo ? 'Aparece para os visitantes.' : 'Salvo mas não exibido.'}</p>
                </div>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-all">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-brand-emerald hover:bg-emerald-600 rounded-lg shadow-sm transition-all disabled:opacity-50">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Adicionar ao Site'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
