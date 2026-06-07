const fs = require('fs');
const path = require('path');
const projectDir = 'c:/Users/Ksa/Downloads/Hubly Serviços';

const { createClient } = require(path.join(projectDir, 'node_modules/@supabase/supabase-js'));

// Read env
const envFile = fs.readFileSync(path.join(projectDir, '.env.local'), 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    envVars[key] = val;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase environment variables not loaded.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  }
];

async function updateServices() {
  try {
    console.log('Fetching current services from database...');
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'services')
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching settings:', error);
      process.exit(1);
    }
    
    let services = DEFAULT_SERVICES;
    if (data && Array.isArray(data.value)) {
      console.log('Found existing services in database. Merging...');
      const dbServices = data.value;
      const merged = [...dbServices];
      DEFAULT_SERVICES.forEach(defS => {
        if (!merged.some(s => s.id === defS.id)) {
          merged.push(defS);
          console.log(`Adding missing service: ${defS.id}`);
        }
      });
      services = merged;
    } else {
      console.log('No services found in database. Initializing with defaults...');
    }
    
    console.log('Updating site_settings services row...');
    const { error: upsertError } = await supabase
      .from('site_settings')
      .upsert({ key: 'services', value: services });
      
    if (upsertError) {
      console.error('Error updating services in database:', upsertError);
    } else {
      console.log('Services successfully updated in Supabase database!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

updateServices();
