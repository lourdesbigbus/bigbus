-- Schema SQL para a tabela de Leads do Hubly Serviços

-- Tabela principal de leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    nome VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    servico VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Atendimento', 'Concluído', 'Pago', 'Perdido')),
    perda_estimada NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    valor_fechado NUMERIC(12, 2),
    observacoes TEXT,
    email VARCHAR(255),
    cep VARCHAR(20),
    concessionaria VARCHAR(100),
    valor_conta NUMERIC(12, 2),
    valor_proposta NUMERIC(12, 2) DEFAULT 0.00,
    temperatura VARCHAR(20) DEFAULT 'Morno' CHECK (temperatura IN ('Frio', 'Morno', 'Quente')),
    motivo_perda VARCHAR(255),
    data_proximo_contato DATE,
    origem VARCHAR(100) DEFAULT 'Landing Page'
);

-- Comentários da tabela para documentação no Supabase
COMMENT ON TABLE public.leads IS 'Tabela que armazena os leads capturados pelas Landing Pages e Calculadora Solar.';
COMMENT ON COLUMN public.leads.perda_estimada IS 'Perda financeira anual estimada em reais para o cliente devido à sujeira nas placas.';
COMMENT ON COLUMN public.leads.valor_fechado IS 'Valor real fechado após negociação do serviço.';

-- Índices para otimização de busca e ordenação no CRM
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads (status);

-- Habilitar Row Level Security (RLS) no Supabase
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Seguro (RLS Policies)

-- 1. Qualquer usuário anônimo (cliente acessando o site) pode registrar novos leads
CREATE POLICY "Permitir inserções públicas de novos leads" ON public.leads
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- 2. Somente administradores autenticados podem ver ou modificar registros de leads
CREATE POLICY "Permitir leitura/escrita total apenas para autenticados" ON public.leads
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Tabela de Configurações do Site (CMS)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL
);

COMMENT ON TABLE public.site_settings IS 'Tabela que armazena os conteúdos editáveis do site (Hero, Serviços, Depoimentos, etc).';

-- Habilitar RLS para site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso para site_settings
CREATE POLICY "Permitir leitura pública de configurações" ON public.site_settings
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Permitir escrita/leitura total de configurações para autenticados" ON public.site_settings
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Configuração do Bucket de Armazenamento para Fotos (site-assets)
-- Nota: A criação de buckets e políticas de storage também pode ser feita via painel do Supabase.
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso para o bucket site-assets
CREATE POLICY "Permitir leitura pública de assets" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'site-assets');

CREATE POLICY "Permitir escrita de assets para autenticados" ON storage.objects
    FOR ALL TO authenticated
    WITH CHECK (bucket_id = 'site-assets');

