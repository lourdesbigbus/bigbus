"use server";

import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { Company, Lead, ServiceTracking } from '@/types';

async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('hubly_admin_auth')?.value;
    if (!token) return false;
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'hublypro123';
    const payload = await verifyToken(token, adminPassword);
    return !!payload && payload.role === 'admin';
  } catch (err) {
    console.error('Error verifying admin session:', err);
    return false;
  }
}

export interface GoogleDriveConfig {
  client_email: string;
  private_key?: string;
  folder_id: string;
  has_private_key?: boolean;
}

/**
 * Recupera as configurações do Google Drive
 */
export async function getGoogleDriveConfigAction(): Promise<{ success: boolean; data?: GoogleDriveConfig; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado.' };
    }

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'google_drive_config')
      .maybeSingle();

    if (error) {
      console.error('Error fetching Google Drive config:', error);
      throw new Error(error.message);
    }

    if (!data || !data.value) {
      return { success: true, data: { client_email: '', folder_id: '', has_private_key: false } };
    }

    const val = data.value as GoogleDriveConfig;
    return {
      success: true,
      data: {
        client_email: val.client_email || '',
        folder_id: val.folder_id || '',
        has_private_key: !!val.private_key
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao carregar configurações do Drive.' };
  }
}

/**
 * Salva as configurações do Google Drive
 */
export async function saveGoogleDriveConfigAction(config: GoogleDriveConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado.' };
    }

    // Obter as credenciais atuais para caso a senha/chave privada não tenha sido reenviada
    const { data: dbData } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'google_drive_config')
      .maybeSingle();

    const currentConfig = dbData ? (dbData.value as GoogleDriveConfig) : null;
    
    let keyToSave = config.private_key;
    if (!keyToSave || keyToSave === '********') {
      keyToSave = currentConfig?.private_key || '';
    }

    const valueToSave = {
      client_email: config.client_email.trim(),
      folder_id: config.folder_id.trim(),
      private_key: keyToSave
    };

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key: 'google_drive_config', value: valueToSave });

    if (error) {
      console.error('Error saving Google Drive config:', error);
      throw new Error(error.message);
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao salvar configurações do Drive.' };
  }
}

/**
 * Auxiliar para assinar JWT RS256 e obter token do Google
 */
function generateGoogleJWT(clientEmail: string, privateKey: string, scope: string): string {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');
  const signatureInput = `${base64Header}.${base64Claim}`;

  // Normalização da chave privada
  let formattedKey = privateKey.trim();
  formattedKey = formattedKey.replace(/\\n/g, '\n');

  if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}`;
  }
  if (!formattedKey.includes('-----END PRIVATE KEY-----')) {
    formattedKey = `${formattedKey}\n-----END PRIVATE KEY-----`;
  }

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(formattedKey, 'base64url');

  return `${signatureInput}.${signature}`;
}

async function getGoogleAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const jwt = generateGoogleJWT(clientEmail, privateKey, 'https://www.googleapis.com/auth/drive');
  
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Autenticação no Google falhou: ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Envia um arquivo CSV para a pasta configurada no Google Drive
 */
async function uploadCSVToGoogleDrive(
  accessToken: string,
  fileName: string,
  csvContent: string,
  folderId?: string
) {
  const metadata: any = {
    name: fileName,
    mimeType: 'text/csv'
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = 'hubly_drive_sync_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // Corpo multiparte com metadados e conteúdo da planilha (com UTF-8 BOM)
  const body = 
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/csv; charset=UTF-8\r\n\r\n' +
    '\ufeff' + csvContent +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: body
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Envio para o Drive falhou: ${errText}`);
  }

  return await res.json();
}

/**
 * Converte arrays em string CSV formatada em pt-BR (separada por ponto e vírgula)
 */
function convertToCSVString(headers: string[], rows: any[][]): string {
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
}

/**
 * Server Action para gerar as 3 planilhas e sincronizar tudo com o Drive
 */
export async function syncAllToGoogleDriveAction(): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado.' };
    }

    // 1. Carregar configurações do Drive
    const { data: dbData } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'google_drive_config')
      .maybeSingle();

    const config = dbData ? (dbData.value as GoogleDriveConfig) : null;
    if (!config || !config.client_email || !config.private_key) {
      return { success: false, error: 'Google Drive não configurado ou credenciais ausentes.' };
    }

    // 2. Buscar Dados no Banco
    // A. Clientes (leads)
    const { data: dbLeads, error: leadsErr } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsErr) throw new Error(`Erro ao buscar leads: ${leadsErr.message}`);

    // B. Empresas
    const { data: dbCompanies, error: compErr } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'companies')
      .maybeSingle();
    
    if (compErr) throw new Error(`Erro ao buscar empresas: ${compErr.message}`);

    // C. Acompanhamentos
    const { data: dbTrackings, error: trackErr } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'service_trackings')
      .maybeSingle();

    if (trackErr) throw new Error(`Erro ao buscar acompanhamentos: ${trackErr.message}`);

    const leadsList: Lead[] = dbLeads || [];
    const companiesList: Company[] = dbCompanies ? (dbCompanies.value as Company[]) : [];
    const trackingsList: ServiceTracking[] = dbTrackings ? (dbTrackings.value as ServiceTracking[]) : [];

    // 3. Gerar Strings CSV
    // Clientes
    const leadsHeaders = [
      'Data de Entrada', 'Nome', 'WhatsApp', 'E-mail', 'Localizacao', 'CEP', 
      'Concessionaria', 'Servico', 'Status', 'Prioridade/Temperatura', 
      'Valor Proposta (R$)', 'Valor Fechado (R$)', 'Valor Conta Luz (R$)', 
      'Perda Estimada (R$)', 'Motivo da Perda', 'Data Proximo Contato', 
      'Origem', 'Observacoes'
    ];
    const leadsRows = leadsList.map(l => [
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
    const leadsCSV = convertToCSVString(leadsHeaders, leadsRows);

    // Empresas
    const companiesHeaders = [
      'Data de Homologacao', 'Nome Fantasia', 'Razao Social', 'CNPJ', 'E-mail', 
      'Telefone', 'WhatsApp', 'Cidade', 'Estado', 'Endereco', 
      'Responsavel Nome', 'Status', 'Qualidade (Score)', 'Avaliacao (Rating)', 
      'Projetos Concluidos', 'Servicos Prestados', 'Observacoes'
    ];
    const companiesRows = companiesList.map(c => [
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
    const companiesCSV = convertToCSVString(companiesHeaders, companiesRows);

    // Serviços (Acompanhamentos)
    const trackingsHeaders = [
      'Data de Criacao', 'Nome do Cliente', 'WhatsApp do Cliente', 'E-mail do Cliente', 
      'Servico Contratado', 'Nome da Empresa Parceira', 'WhatsApp da Empresa', 
      'Etapa Atual', 'Data de Inicio', 'Previsao de Entrega', 'Observacoes'
    ];
    const trackingsRows = trackingsList.map(t => [
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
    const trackingsCSV = convertToCSVString(trackingsHeaders, trackingsRows);

    // 4. Obter token de acesso e fazer upload das 3 planilhas
    const accessToken = await getGoogleAccessToken(config.client_email, config.private_key);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const fileLeadsName = `hubly_clientes_${todayStr}.csv`;
    const fileCompaniesName = `hubly_empresas_${todayStr}.csv`;
    const fileTrackingsName = `hubly_servicos_${todayStr}.csv`;

    await Promise.all([
      uploadCSVToGoogleDrive(accessToken, fileLeadsName, leadsCSV, config.folder_id),
      uploadCSVToGoogleDrive(accessToken, fileCompaniesName, companiesCSV, config.folder_id),
      uploadCSVToGoogleDrive(accessToken, fileTrackingsName, trackingsCSV, config.folder_id)
    ]);

    return {
      success: true,
      data: [fileLeadsName, fileCompaniesName, fileTrackingsName]
    };
  } catch (error: any) {
    console.error('Google Drive Sync error:', error);
    return { success: false, error: error.message || 'Erro na sincronização de dados com o Drive.' };
  }
}
