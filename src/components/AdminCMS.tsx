"use client";

import React, { useEffect, useState } from 'react';
import { 
  getAllSiteSettingsAction, 
  saveSiteSettingsAction, 
  uploadSiteImageAction 
} from '@/app/actions/settings';
import { 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Loader2, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  MessageSquare,
  BadgeCheck,
  Settings
} from 'lucide-react';

const DEFAULT_HERO = {
  badge: "Hub de Empresas 100% Homologadas",
  title_part1: "CONTRATE COM",
  title_part2: "SEGURANÇA",
  title_part3: "E ECONOMIA",
  description: "Sua plataforma definitiva para contratar serviços homologados de automação, energia limpa, segurança e climatização com total tranquilidade.",
  cta_text: "Solicitar Orçamento Grátis",
  trust_subtitle: "Clientes satisfeitos em SC"
};

const DEFAULT_SERVICES = [
  {
    id: 'limpeza_solar',
    title: 'Limpeza Técnica de Placas',
    image: '/images/limpeza.png',
    icon: 'Sun',
    href: '/calculadora',
    description: 'Descubra quanto você está deixando de ganhar por causa da sujeira nos seus painéis solares.',
    subpage_image: '/images/limpeza.png',
    differentials_title: 'Diferenciais do Serviço:',
    differentials: [
      'Aumento imediato de até 25% na geração',
      'Prevenção de danos permanentes (hotspots)',
      'Uso de água desmineralizada e produtos corretos',
      'Equipe certificada para trabalho em altura (NR35)'
    ],
    hidden: false
  },
  {
    id: 'instalacao_manutencao',
    title: 'Instalação e Manutenção',
    image: '/images/instalacao.png',
    icon: 'Wrench',
    href: '/instalacao',
    description: 'Projetos de energia solar de alta performance, desde a homologação até o monitoramento ativo.',
    subpage_image: '/images/instalacao.png',
    differentials_title: 'O que garantimos:',
    differentials: [
      'Projetos assinados por Engenheiros Homologados',
      'Uso de materiais de primeira linha (Tier 1)',
      'Pós-venda e monitoramento ativo pela Hubly Pro',
      'Instalação rápida e com limpeza total'
    ],
    hidden: false
  },
  {
    id: 'automacao_residencial',
    title: 'Automação Residencial',
    image: '/images/automacao_residencial.png',
    icon: 'Cpu',
    href: '/automacao-residencial',
    description: 'Sistemas completos de automação residencial. Controle iluminação, som, persianas e climatização de forma inteligente e integrada.',
    subpage_image: '/images/automacao_residencial.png',
    differentials_title: 'O que garantimos:',
    differentials: [
      'Projetos personalizados e integração inteligente de sistemas',
      'Controle unificado via smartphone, tablet ou assistente de voz',
      'Automação de iluminação cênica, persianas e climatização',
      'Sonorização multiroom e home theater de alta fidelidade'
    ],
    hidden: false
  },
  {
    id: 'aquecimento_piso',
    title: 'Aquecimento de Piso Premium',
    image: '/images/aquecimento.png',
    icon: 'ThermometerSun',
    href: '/aquecimento',
    description: 'O máximo conforto térmico para sua casa com tecnologia de ponta e instalação auditada pela Hubly Pro.',
    subpage_image: '/images/aquecimento.png',
    differentials_title: 'Diferenciais do Hub:',
    differentials: [
      'Sistemas de alta eficiência e baixo consumo',
      'Instalação especializada sem sujeira',
      'Controle total via smartphone',
      'Garantia estendida via Hubly Pro'
    ],
    hidden: false
  },
  {
    id: 'controle_acesso',
    title: 'Controle de Acesso',
    image: '/images/controle_acesso.png',
    icon: 'Fingerprint',
    href: '/controle-acesso',
    description: 'Sistemas inteligentes de identificação, biometria e controle de fluxo para condomínios e empresas.',
    subpage_image: '/images/controle_acesso.png',
    differentials_title: 'Diferenciais do Serviço:',
    differentials: [
      'Reconhecimento facial e biometria de última geração',
      'Integração com sistemas de segurança e portaria',
      'Controle de fluxo de pedestres e veículos por aplicativo',
      'Suporte técnico 24h e manutenção preventiva'
    ],
    hidden: false
  },
  {
    id: 'ar_condicionado',
    title: 'Instalação e Manutenção de Ar Condicionado',
    image: '/images/ar_condicionado.png',
    icon: 'Snowflake',
    href: '/ar-condicionado',
    description: 'Projetos de climatização residencial e comercial, higienização profissional e carga de gás com garantia.',
    subpage_image: '/images/ar_condicionado.png',
    differentials_title: 'Diferenciais do Serviço:',
    differentials: [
      'Técnicos certificados e credenciados pelos fabricantes',
      'Higienização completa para eliminação de fungos e bactérias',
      'Dimensionamento térmico exato para economia de energia',
      'Instalação rápida que mantém a garantia de fábrica'
    ],
    hidden: false
  },
  {
    id: 'carregamento_veicular',
    title: 'Carregamento Veicular',
    image: '/images/carregamento.png',
    icon: 'Zap',
    href: '/carregamento-veicular',
    description: 'Soluções completas de carregamento para veículos elétricos (VE), com projetos homologados para residências, condomínios e comércios.',
    subpage_image: '/images/carregamento.png',
    differentials_title: 'Diferenciais do Serviço:',
    differentials: [
      'Projetos de infraestrutura elétrica sob medida (homologação na concessionária)',
      'Instalação de carregadores rápidos (Wallbox) com proteção total (DPS e DR)',
      'Estudos de viabilidade técnica e gestão de consumo de energia',
      'Técnicos especialistas certificados com conformidade à norma NBR 5410 e NR10'
    ],
    hidden: false
  }
];

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    text: "Fiquei impressionado com a diferença na geração após a limpeza. A equipe foi muito técnica e cuidadosa. Recomendo fortemente para quem quer manter o sistema no máximo!",
    service: "Limpeza Técnica de Placas",
    serviceId: "limpeza_solar",
    name: "Carlos Eduardo",
    location: "Florianópolis, SC",
    rating: 5
  },
  {
    id: 2,
    text: "Instalação impecável. Tudo organizado, cabos bem passados e suporte nota 10. O Hubly Pro realmente seleciona as melhores empresas, me senti muito seguro durante todo o processo.",
    service: "Instalação de Energia Solar",
    serviceId: "instalacao_manutencao",
    name: "Mariana Souza",
    location: "Joinville, SC",
    rating: 5
  },
  {
    id: 3,
    text: "O aquecimento de piso foi a melhor decisão que tomamos para nossa casa na serra. Conforto térmico absoluto e um acabamento de primeira. Os técnicos são verdadeiros especialistas.",
    service: "Aquecimento de Piso Premium",
    serviceId: "aquecimento_piso",
    name: "Roberto Almeida",
    location: "Blumenau, SC",
    rating: 5
  },
  {
    id: 4,
    text: "O sistema tinha perdido quase 20% de eficiência. Após a limpeza técnica da Hubly Pro, os números voltaram ao normal no mesmo dia. Investimento que se paga muito rápido.",
    service: "Limpeza Técnica de Placas",
    serviceId: "limpeza_solar",
    name: "Ricardo Mendes",
    location: "São José, SC",
    rating: 5
  },
  {
    id: 5,
    text: "Excelente atendimento do início ao fim. A equipe de instalação foi muito pontual e o sistema está funcionando perfeitamente. O acompanhamento da Hubly faz toda a diferença.",
    service: "Instalação de Energia Solar",
    serviceId: "instalacao_manutencao",
    name: "Felipe Oliveira",
    location: "Itajaí, SC",
    rating: 5
  },
  {
    id: 6,
    text: "Sistema de aquecimento de piso de altíssima qualidade. A automação funciona super bem e o calor é muito uniforme. Equipe técnica muito bem preparada e educada.",
    service: "Aquecimento de Piso Premium",
    serviceId: "aquecimento_piso",
    name: "Juliana Costa",
    location: "Lages, SC",
    rating: 5
  }
];

const DEFAULT_TRUST = {
  badge: "Qualidade Homologada",
  title_part1: "POR QUE CONTRATAR",
  title_part2: "VIA HUBLY PRO?",
  description: "Diferente de contratar uma empresa direto no escuro, o Hubly Pro é a sua camada de proteção absoluta. Selecionamos apenas a elite do mercado.",
  certified_title: "Certificado de Homologação",
  certified_desc: "Apenas 15% das empresas que aplicam são aprovadas em nosso processo de auditoria.",
  steps: [
    {
      title: "Triagem Rigorosa",
      description: "Analisamos o histórico, certificações e a saúde financeira de cada empresa parceira antes de entrar no Hub."
    },
    {
      title: "Garantia de Qualidade",
      description: "A Hubly Pro audita os projetos para garantir que a instalação siga as normas técnicas e de segurança."
    },
    {
      title: "Melhor Negociação",
      description: "Por sermos um Hub, negociamos em grande volume para garantir o melhor preço para você cliente final."
    }
  ]
};

export default function AdminCMS() {
  const [subTab, setSubTab] = useState<'hero' | 'services' | 'testimonials' | 'trust' | 'general'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // States para Formulários
  const [heroData, setHeroData] = useState(DEFAULT_HERO);
  const [servicesData, setServicesData] = useState(DEFAULT_SERVICES);
  const [testimonialsData, setTestimonialsData] = useState(DEFAULT_TESTIMONIALS);
  const [trustData, setTrustData] = useState(DEFAULT_TRUST);
  const [generalData, setGeneralData] = useState({ whatsappNumber: '5548999999999' });

  // Loading image state
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getAllSiteSettingsAction();
      if (res.success && res.data) {
        const data = res.data;
        if (data.hero) setHeroData({ ...DEFAULT_HERO, ...data.hero });
        if (data.services) {
          const dbServices = Array.isArray(data.services) ? data.services : [];
          const merged = [...dbServices];
          DEFAULT_SERVICES.forEach(defS => {
            if (!merged.some(s => s.id === defS.id)) {
              merged.push(defS);
            }
          });
          setServicesData(merged);
        }
        if (data.testimonials) setTestimonialsData(data.testimonials);
        if (data.trust) setTrustData({ ...DEFAULT_TRUST, ...data.trust });
        if (data.general) setGeneralData({ ...generalData, ...data.general });
      }
    } catch (err: any) {
      console.error("Erro ao carregar dados do CMS:", err);
      setErrorMsg("Erro ao buscar configurações no Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    try {
      setSaving(true);
      setErrorMsg('');
      setSaveSuccess(false);

      const res = await saveSiteSettingsAction(key, value);
      if (!res.success) {
        throw new Error(res.error);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(`Erro ao salvar ${key}:`, err);
      setErrorMsg(err.message || 'Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void, uniqueId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImageId(uniqueId);
      setErrorMsg('');
      
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadSiteImageAction(formData);
      if (!res.success || !res.url) {
        throw new Error(res.error || 'Erro no upload.');
      }

      callback(res.url);
    } catch (err: any) {
      console.error('Erro no upload da imagem:', err);
      setErrorMsg(err.message || 'Erro ao fazer upload da imagem.');
    } finally {
      setUploadingImageId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-16 rounded-xl border border-slate-200 shadow-sm text-center">
        <Loader2 className="w-10 h-10 text-brand-emerald animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Carregando painel do site...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerta de Feedback */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>Alterações gravadas com sucesso no Supabase! O site já foi atualizado.</span>
        </div>
      )}

      {/* Sub-Navegação interna de abas CMS */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl p-2 gap-2 shadow-sm flex-wrap">
        {[
          { id: 'hero', name: 'Seção Principal (Hero)', icon: Sparkles },
          { id: 'services', name: 'Serviços', icon: ShieldCheck },
          { id: 'testimonials', name: 'Depoimentos', icon: MessageSquare },
          { id: 'trust', name: 'Por que Nós? (Confiança)', icon: BadgeCheck },
          { id: 'general', name: 'Configurações Gerais', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSubTab(tab.id as any);
              setErrorMsg('');
              setSaveSuccess(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              subTab === tab.id
                ? 'bg-slate-100 text-slate-800 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Conteúdo das Abas CMS */}
      <div className="bg-white p-6 rounded-b-xl border-x border-b border-slate-200 shadow-sm min-h-[350px]">
        {/* ABA HERO */}
        {subTab === 'hero' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Textos da Seção de Entrada (Hero)</h3>
              <p className="text-xs text-slate-500">Altere o texto principal exibido no topo da página inicial.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Minicard Superior</label>
                <input
                  type="text"
                  value={heroData.badge}
                  onChange={(e) => setHeroData({ ...heroData, badge: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                  placeholder="Ex: Hub de Empresas 100% Homologadas"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Texto do Botão (CTA)</label>
                <input
                  type="text"
                  value={heroData.cta_text}
                  onChange={(e) => setHeroData({ ...heroData, cta_text: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                  placeholder="Ex: Solicitar Orçamento Grátis"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título - Parte 1</label>
                <input
                  type="text"
                  value={heroData.title_part1}
                  onChange={(e) => setHeroData({ ...heroData, title_part1: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald font-bold"
                  placeholder="CONTRATE COM"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título - Parte 2 (Destacada em Verde)</label>
                <input
                  type="text"
                  value={heroData.title_part2}
                  onChange={(e) => setHeroData({ ...heroData, title_part2: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-brand-emerald/40 text-brand-emerald rounded-md focus:outline-none focus:border-brand-emerald font-bold"
                  placeholder="SEGURANÇA"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título - Parte 3</label>
                <input
                  type="text"
                  value={heroData.title_part3}
                  onChange={(e) => setHeroData({ ...heroData, title_part3: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald font-bold"
                  placeholder="E ECONOMIA"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Principal</label>
              <textarea
                value={heroData.description}
                onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                className="w-full text-xs p-3 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald min-h-[80px]"
                placeholder="Insira a descrição que aparece abaixo do título principal..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subtítulo do Grid de Clientes</label>
              <input
                type="text"
                value={heroData.trust_subtitle}
                onChange={(e) => setHeroData({ ...heroData, trust_subtitle: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                placeholder="Ex: Clientes satisfeitos em SC"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleSave('hero', heroData)}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Seção Principal
              </button>
            </div>
          </div>
        )}

        {/* ABA SERVIÇOS */}
        {subTab === 'services' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Lista de Serviços Homologados</h3>
              <p className="text-xs text-slate-500">Configure os títulos, links e troque as imagens de exibição dos serviços.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {servicesData.map((service, index) => {
                const serviceUniqueId = `service_${service.id}`;
                const isUploading = uploadingImageId === serviceUniqueId;

                return (
                  <div key={service.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col md:flex-row gap-5 items-start">
                    {/* Imagem do Serviço */}
                    <div className="w-24 h-24 bg-white border border-slate-200 rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 text-brand-emerald animate-spin" />
                      ) : (
                        <>
                          <img src={service.image} alt={service.title} className="w-full h-full object-contain" />
                          <label className="absolute inset-0 bg-slate-900/60 text-white text-[9px] font-bold opacity-0 hover:opacity-100 flex flex-col justify-center items-center cursor-pointer transition-opacity">
                            <Upload className="w-4 h-4 mb-1" />
                            Trocar Foto
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleImageUpload(e, (url) => {
                                  const updated = [...servicesData];
                                  updated[index].image = url;
                                  setServicesData(updated);
                                }, serviceUniqueId);
                              }}
                            />
                          </label>
                        </>
                      )}
                    </div>

                    {/* Dados do Serviço */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título do Serviço</label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={service.hidden || false}
                              onChange={(e) => {
                                const updated = [...servicesData];
                                updated[index].hidden = e.target.checked;
                                setServicesData(updated);
                              }}
                              className="w-3.5 h-3.5 text-brand-emerald border-slate-300 rounded focus:ring-brand-emerald"
                            />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Ocultar no site</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) => {
                            const updated = [...servicesData];
                            updated[index].title = e.target.value;
                            setServicesData(updated);
                          }}
                          className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald font-semibold"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Link (HREF)</label>
                          <input
                            type="text"
                            value={service.href}
                            onChange={(e) => {
                              const updated = [...servicesData];
                              updated[index].href = e.target.value;
                              setServicesData(updated);
                            }}
                            className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ícone (Nome Lucide)</label>
                          <input
                            type="text"
                            value={service.icon}
                            onChange={(e) => {
                              const updated = [...servicesData];
                              updated[index].icon = e.target.value;
                              setServicesData(updated);
                            }}
                            className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Descrição da Subpágina */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Textual (Subpágina do Serviço)</label>
                        <textarea
                          value={service.description || ''}
                          onChange={(e) => {
                            const updated = [...servicesData];
                            updated[index].description = e.target.value;
                            setServicesData(updated);
                          }}
                          className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald min-h-[60px]"
                          placeholder="Escreva o texto explicativo sobre o serviço que aparecerá na subpágina..."
                        />
                      </div>

                      {/* Foto Subpágina & Título dos Diferenciais */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Foto Principal (Subpágina)</label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-10 bg-white border border-slate-200 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {uploadingImageId === `subpage_${service.id}` ? (
                              <Loader2 className="w-4 h-4 text-brand-emerald animate-spin" />
                            ) : (
                              <img src={service.subpage_image || service.image} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <label className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm">
                            <Upload className="w-3.5 h-3.5" /> Enviar Foto
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleImageUpload(e, (url) => {
                                  const updated = [...servicesData];
                                  updated[index].subpage_image = url;
                                  setServicesData(updated);
                                }, `subpage_${service.id}`);
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título da Lista de Diferenciais</label>
                        <input
                          type="text"
                          value={service.differentials_title || ''}
                          onChange={(e) => {
                            const updated = [...servicesData];
                            updated[index].differentials_title = e.target.value;
                            setServicesData(updated);
                          }}
                          className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none"
                          placeholder="Ex: Diferenciais do Hub:"
                        />
                      </div>

                      {/* Itens Diferenciais */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Itens da Lista de Diferenciais (4 itens)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[0, 1, 2, 3].map((diffIndex) => (
                            <input
                              key={diffIndex}
                              type="text"
                              value={service.differentials?.[diffIndex] || ''}
                              onChange={(e) => {
                                const updated = [...servicesData];
                                if (!updated[index].differentials) {
                                  updated[index].differentials = ['', '', '', ''];
                                }
                                updated[index].differentials[diffIndex] = e.target.value;
                                setServicesData(updated);
                              }}
                              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-md focus:outline-none"
                              placeholder={`Diferencial ${diffIndex + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleSave('services', servicesData)}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Serviços
              </button>
            </div>
          </div>
        )}

        {/* ABA DEPOIMENTOS */}
        {subTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Depoimentos dos Clientes</h3>
                <p className="text-xs text-slate-500">Adicione, edite ou remova avaliações exibidas nas páginas.</p>
              </div>
              <button
                onClick={() => {
                  const newTestimonial = {
                    id: Date.now(),
                    text: '',
                    service: 'Limpeza Técnica de Placas',
                    serviceId: 'limpeza_solar' as any,
                    name: '',
                    location: '',
                    rating: 5
                  };
                  setTestimonialsData([...testimonialsData, newTestimonial]);
                }}
                className="bg-brand-emerald text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Depoimento
              </button>
            </div>

            {testimonialsData.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs italic">
                Nenhum depoimento cadastrado. Clique no botão acima para adicionar.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonialsData.map((testimonial, index) => {
                  return (
                    <div key={testimonial.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 relative">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <select
                          value={testimonial.serviceId}
                          onChange={(e) => {
                            const val = e.target.value;
                            const relatedService = servicesData.find(s => s.id === val);
                            const updated = [...testimonialsData];
                            updated[index].serviceId = val as any;
                            updated[index].service = relatedService ? relatedService.title : 'Outro';
                            setTestimonialsData(updated);
                          }}
                          className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="limpeza_solar">Limpeza Técnica de Placas</option>
                          <option value="instalacao_manutencao">Instalação e Manutenção</option>
                          <option value="automacao_residencial">Automação Residencial</option>
                          <option value="aquecimento_piso">Aquecimento de Piso Premium</option>
                          <option value="controle_acesso">Controle de Acesso</option>
                          <option value="ar_condicionado">Ar Condicionado</option>
                          <option value="carregamento_veicular">Carregamento Veicular</option>
                        </select>
                        
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5 mr-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 cursor-pointer ${
                                  star <= testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                                }`}
                                onClick={() => {
                                  const updated = [...testimonialsData];
                                  updated[index].rating = star;
                                  setTestimonialsData(updated);
                                }}
                              />
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Deseja realmente excluir este depoimento?')) {
                                setTestimonialsData(testimonialsData.filter(t => t.id !== testimonial.id));
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-all cursor-pointer"
                            title="Excluir Depoimento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nome do Cliente</label>
                          <input
                            type="text"
                            value={testimonial.name}
                            onChange={(e) => {
                              const updated = [...testimonialsData];
                              updated[index].name = e.target.value;
                              setTestimonialsData(updated);
                            }}
                            className="w-full text-xs px-3 py-1.5 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald"
                            placeholder="Ex: Carlos Eduardo"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Localização</label>
                          <input
                            type="text"
                            value={testimonial.location}
                            onChange={(e) => {
                              const updated = [...testimonialsData];
                              updated[index].location = e.target.value;
                              setTestimonialsData(updated);
                            }}
                            className="w-full text-xs px-3 py-1.5 border border-slate-200 bg-white rounded-md focus:outline-none"
                            placeholder="Ex: Florianópolis, SC"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Depoimento</label>
                        <textarea
                          value={testimonial.text}
                          onChange={(e) => {
                            const updated = [...testimonialsData];
                            updated[index].text = e.target.value;
                            setTestimonialsData(updated);
                          }}
                          className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald min-h-[75px] resize-none"
                          placeholder="Escreva a avaliação do cliente aqui..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleSave('testimonials', testimonialsData)}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Depoimentos
              </button>
            </div>
          </div>
        )}

        {/* ABA CONFIANÇA */}
        {subTab === 'trust' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Por que Hubly Pro (Seção de Confiança)</h3>
              <p className="text-xs text-slate-500">Configure os títulos da seção com fundo escuro e os 3 passos de triagem.</p>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">Textos Principais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Minicard Superior</label>
                  <input
                    type="text"
                    value={trustData.badge}
                    onChange={(e) => setTrustData({ ...trustData, badge: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título Principal - Parte 1</label>
                  <input
                    type="text"
                    value={trustData.title_part1}
                    onChange={(e) => setTrustData({ ...trustData, title_part1: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título Principal - Parte 2 (Destacado em Verde)</label>
                  <input
                    type="text"
                    value={trustData.title_part2}
                    onChange={(e) => setTrustData({ ...trustData, title_part2: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-brand-emerald/40 text-brand-emerald bg-white rounded-md focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Principal</label>
                  <textarea
                    value={trustData.description}
                    onChange={(e) => setTrustData({ ...trustData, description: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md focus:outline-none min-h-[50px]"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">Card de Certificado (Processo de Auditoria)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título do Certificado</label>
                  <input
                    type="text"
                    value={trustData.certified_title}
                    onChange={(e) => setTrustData({ ...trustData, certified_title: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Detalhada do Certificado</label>
                  <textarea
                    value={trustData.certified_desc}
                    onChange={(e) => setTrustData({ ...trustData, certified_desc: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md focus:outline-none min-h-[50px]"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">Os 3 Passos da Metodologia</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trustData.steps.map((step, index) => (
                  <div key={index} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                    <span className="text-[10px] font-bold text-slate-400">PASSO {index + 1}</span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const updatedSteps = [...trustData.steps];
                        updatedSteps[index].title = e.target.value;
                        setTrustData({ ...trustData, steps: updatedSteps });
                      }}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md font-semibold focus:outline-none focus:border-brand-emerald"
                      placeholder="Título"
                    />
                    <textarea
                      value={step.description}
                      onChange={(e) => {
                        const updatedSteps = [...trustData.steps];
                        updatedSteps[index].description = e.target.value;
                        setTrustData({ ...trustData, steps: updatedSteps });
                      }}
                      className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none min-h-[60px] resize-none"
                      placeholder="Descrição"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleSave('trust', trustData)}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Seção Confiança
              </button>
            </div>
          </div>
        )}

        {/* ABA GERAL */}
        {subTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Configurações Gerais do Site</h3>
              <p className="text-xs text-slate-500">Configure detalhes de funcionamento e canais de contato direto do site.</p>
            </div>

            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <div className="max-w-md space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Número do WhatsApp (Destinatário)</label>
                <input
                  type="text"
                  value={generalData.whatsappNumber}
                  onChange={(e) => setGeneralData({ ...generalData, whatsappNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald font-bold"
                  placeholder="Ex: 5548999999999"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Insira o número completo com código do país (Brasil: 55) + DDD (ex: 48) + Número, <strong>sem espaços, traços ou parênteses</strong>. 
                  Este é o número que receberá os cliques do botão de orçamento e calculadora solar.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleSave('general', generalData)}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Configurações
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
