export type LeadStatus = 'Pendente' | 'Em Atendimento' | 'Concluído' | 'Pago' | 'Perdido';

export interface Lead {
  id: string;
  created_at: string;
  nome: string;
  whatsapp: string;
  localizacao: string;
  servico: string;
  perda_estimada: number;
  status: LeadStatus;
  observacoes?: string;
  valor_fechado?: number;
  email?: string;
  cep?: string;
  concessionaria?: string;
  valor_conta?: number;
  valor_proposta?: number;
  temperatura?: 'Frio' | 'Morno' | 'Quente';
  motivo_perda?: string;
  data_proximo_contato?: string;
  origem?: string;
  projeto_solar_etapa?: string;
  solar_kwp?: number;
  solar_inversor?: string;
  solar_paineis?: number;
  solar_protocolo?: string;
  solar_prazo_etapa?: string;    // data limite da etapa atual (YYYY-MM-DD)
  solar_pendencia?: string;      // descrição de pendência ou próxima ação
}

export interface GaleriaItem {
  id: string;
  created_at: string;
  tipo: 'foto' | 'depoimento' | 'ambos';
  servico: string;           // 'geral' ou nome do serviço
  cliente_nome: string;
  cliente_cidade?: string;
  avaliacao: number;         // 1-5
  texto?: string;            // texto do depoimento
  foto_url?: string;         // URL externa da foto
  ativo: boolean;
}

export interface Company {
  id: string;
  created_at: string;
  nome_fantasia: string;
  razao_social?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  cidade: string;
  estado: string;
  endereco?: string;
  responsavel_nome?: string;
  status: 'Ativo' | 'Inativo' | 'Pendente' | 'Bloqueado';
  servicos: string[];
  score: number; // pontuação geral de 0 a 100
  rating: number; // avaliação por estrelas (ex: 0 a 5)
  projetos_concluidos: number;
  observacoes?: string;
  logo_url?: string;
}

export interface ServiceTracking {
  id: string;
  created_at: string;
  lead_id?: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  cliente_email: string;
  servico: string;
  empresa_id: string;
  empresa_nome: string;
  empresa_whatsapp?: string;
  empresa_email?: string;
  etapa: 'planejamento' | 'agendamento' | 'execucao' | 'vistoria' | 'finalizado';
  data_inicio?: string;
  data_previsao?: string;
  observacoes?: string;
}

