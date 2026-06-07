const fs = require('fs');
const path = require('path');
const projectDir = 'c:/Users/Ksa/Downloads/Hubly Serviços';

// Require local supabase-js
const { createClient } = require(path.join(projectDir, 'node_modules/@supabase/supabase-js'));

// Ler .env.local manualmente
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
  console.error('Erro: Variáveis do Supabase não carregadas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInsert() {
  try {
    console.log('Tentando inserir um lead de teste no banco de dados...');
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        nome: 'Lead de Teste Antigravity',
        whatsapp: '5548999999999',
        localizacao: 'Florianópolis, SC',
        servico: 'Limpeza Técnica de Placas',
        status: 'Pendente',
        perda_estimada: 120.50
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao inserir lead:', error);
    } else {
      console.log('Sucesso! Lead inserido:', data);
      
      // Deletar após o teste
      const { error: delError } = await supabase
        .from('leads')
        .delete()
        .eq('id', data.id);
        
      if (delError) {
        console.error('Erro ao deletar lead de teste:', delError);
      } else {
        console.log('Lead de teste limpo com sucesso.');
      }
    }
  } catch (err) {
    console.error('Exceção capturada:', err);
  }
}

testInsert();
