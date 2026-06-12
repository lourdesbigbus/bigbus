"use server";

import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';
import { revalidatePath } from 'next/cache';

/**
 * Helper to verify if the request is from an authenticated administrator session.
 */
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

/**
 * Fetches a single setting by key.
 */
export async function getSiteSettingsAction(key: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching site setting for key ${key}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data ? data.value : null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar as configurações.' };
  }
}

/**
 * Fetches all site settings.
 */
export async function getAllSiteSettingsAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*');

    if (error) {
      console.error('Error fetching all site settings:', error);
      return { success: false, error: error.message };
    }

    const settingsMap = (data || []).reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return { success: true, data: settingsMap };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar todas as configurações.' };
  }
}

/**
 * Saves or updates a setting by key.
 * Restrito a administradores autenticados.
 */
export async function saveSiteSettingsAction(key: string, value: any) {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key, value });

    if (error) {
      console.error(`Error saving site setting for key ${key}:`, error);
      throw new Error(error.message);
    }

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao salvar as configurações.' };
  }
}

/**
 * Uploads a site image to Supabase Storage bucket 'site-assets'.
 * Restrito a administradores autenticados.
 */
export async function uploadSiteImageAction(formData: FormData) {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'Nenhum arquivo enviado.' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'png';
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomStr}.${fileExtension}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('site-assets')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Error uploading image to storage:', error);
      throw new Error(error.message);
    }

    // Gerar URL pública do arquivo
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('site-assets')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao fazer o upload da imagem.' };
  }
}

/**
 * Fetches the currently configured admin email.
 */
export async function getAdminEmailAction() {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado.' };
    }

    const adminEmailEnv = process.env.ADMIN_EMAIL || 'admin@hubly.com';

    const { data: dbCreds } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_credentials')
      .maybeSingle();

    const currentEmail = dbCreds ? dbCreds.value.email : adminEmailEnv;

    return { success: true, email: currentEmail };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar e-mail mestre.' };
  }
}

/**
 * Updates the admin credentials (email and/or password) in the database.
 * Requires verifying the current password first.
 */
export async function updateAdminCredentialsAction(credentials: {
  email: string;
  novaSenha?: string;
  senhaAtual: string;
}) {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    const adminEmailEnv = process.env.ADMIN_EMAIL || 'admin@hubly.com';
    const adminPasswordEnv = process.env.ADMIN_PASSWORD || 'hublypro123';

    // 1. Obter as credenciais atuais
    const { data: dbCreds } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_credentials')
      .maybeSingle();

    const currentPassword = dbCreds ? dbCreds.value.password : adminPasswordEnv;

    // 2. Verificar se a senha atual está correta
    if (credentials.senhaAtual !== currentPassword) {
      return { success: false, error: 'A senha atual está incorreta.' };
    }

    // 3. Validar novas entradas
    const newEmail = credentials.email.trim();
    if (!newEmail) {
      return { success: false, error: 'O e-mail mestre é obrigatório.' };
    }

    let newPassword = currentPassword;
    if (credentials.novaSenha) {
      const trimmedNewSenha = credentials.novaSenha.trim();
      if (trimmedNewSenha.length < 8) {
        return { success: false, error: 'A nova senha deve conter no mínimo 8 caracteres.' };
      }
      newPassword = trimmedNewSenha;
    }

    // 4. Salvar as credenciais no banco de dados (chave admin_credentials)
    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({
        key: 'admin_credentials',
        value: {
          email: newEmail,
          password: newPassword
        }
      });

    if (error) {
      console.error('Error updating admin credentials:', error);
      return { success: false, error: 'Erro ao salvar credenciais no banco de dados.' };
    }

    // 5. Excluir o cookie para forçar re-autenticação imediata
    const cookieStore = await cookies();
    cookieStore.delete('hubly_admin_auth');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao atualizar as credenciais.' };
  }
}
