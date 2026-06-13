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
const supabaseServiceKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis do Supabase não carregadas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testQueryGaleria() {
  try {
    console.log('Tentando consultar a tabela galeria...');
    const { data, error } = await supabase
      .from('galeria')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Erro ao consultar galeria:', error);
    } else {
      console.log('Sucesso ao consultar galeria! Dados:', data);
    }
  } catch (err) {
    console.error('Exceção capturada:', err);
  }
}

testQueryGaleria();
