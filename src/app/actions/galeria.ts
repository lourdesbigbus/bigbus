"use server";

import { supabaseAdmin } from '@/lib/supabase-admin';
import { GaleriaItem } from '@/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';

async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('hubly_admin_auth')?.value;
    if (!token) return false;
    const adminPassword = process.env.ADMIN_PASSWORD || 'hublypro123';
    const payload = await verifyToken(token, adminPassword);
    return !!payload && payload.role === 'admin';
  } catch { return false; }
}

/** Busca pública — usada pelo frontend do site */
export async function getGaleriaAction(servico?: string): Promise<{ success: boolean; data?: GaleriaItem[]; error?: string }> {
  try {
    let query = supabaseAdmin
      .from('galeria')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (servico && servico !== 'geral') {
      // Retorna itens do serviço específico + itens "geral" (válidos para todos)
      query = supabaseAdmin
        .from('galeria')
        .select('*')
        .eq('ativo', true)
        .in('servico', [servico, 'geral'])
        .order('created_at', { ascending: false });
    }

    const { data, error } = await query.limit(50);
    if (error) throw new Error(error.message);
    return { success: true, data: data as GaleriaItem[] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Busca TODOS os itens (ativos e inativos) — só para o admin */
export async function getGaleriaAdminAction(): Promise<{ success: boolean; data?: GaleriaItem[]; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) return { success: false, error: 'Acesso não autorizado.' };

    const { data, error } = await supabaseAdmin
      .from('galeria')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return { success: true, data: data as GaleriaItem[] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Cria novo item de galeria */
export async function createGaleriaItemAction(item: Omit<GaleriaItem, 'id' | 'created_at'>): Promise<{ success: boolean; data?: GaleriaItem; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) return { success: false, error: 'Acesso não autorizado.' };

    const { data, error } = await supabaseAdmin
      .from('galeria')
      .insert([item])
      .select()
      .single();

    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, data: data as GaleriaItem };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Atualiza item de galeria */
export async function updateGaleriaItemAction(item: GaleriaItem): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) return { success: false, error: 'Acesso não autorizado.' };

    const { error } = await supabaseAdmin
      .from('galeria')
      .update({
        tipo: item.tipo,
        servico: item.servico,
        cliente_nome: item.cliente_nome,
        cliente_cidade: item.cliente_cidade,
        avaliacao: item.avaliacao,
        texto: item.texto,
        foto_url: item.foto_url,
        ativo: item.ativo,
      })
      .eq('id', item.id);

    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Ativa / desativa item */
export async function toggleGaleriaAtivoAction(id: string, ativo: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) return { success: false, error: 'Acesso não autorizado.' };

    const { error } = await supabaseAdmin.from('galeria').update({ ativo }).eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Remove item permanentemente */
export async function deleteGaleriaItemAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) return { success: false, error: 'Acesso não autorizado.' };

    const { error } = await supabaseAdmin.from('galeria').delete().eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
