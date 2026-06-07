"use server";

import { supabaseAdmin } from '@/lib/supabase-admin';
import { Lead, LeadStatus } from '@/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';

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
 * Creates a new lead in Supabase database.
 * This is public and can be invoked by anyone submitting a form on the site.
 */
export async function createLeadAction(leadData: Omit<Lead, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      console.error('Error creating lead in database:', error);
      throw new Error(error.message);
    }

    // Revalidate CRM dashboard cache so new lead appears immediately if admin is viewing
    revalidatePath('/admin');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao registrar o lead' };
  }
}

/**
 * Fetches all leads from the Supabase database.
 * Restrito para administradores autenticados.
 */
export async function getLeadsAction(): Promise<{ success: boolean; data?: Lead[]; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads from database:', error);
      throw new Error(error.message);
    }

    return { success: true, data: data as Lead[] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar os leads' };
  }
}

/**
 * Updates a lead's status in Supabase.
 * Restrito para administradores autenticados.
 */
export async function updateLeadStatusAction(id: string, newStatus: LeadStatus) {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead status in database:', error);
      throw new Error(error.message);
    }

    revalidatePath('/admin');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao atualizar o status' };
  }
}

/**
 * Updates lead details (observations and closed deal value) in Supabase.
 * Restrito para administradores autenticados.
 */
export async function updateLeadDetailsAction(lead: Lead) {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .update({
        nome: lead.nome,
        whatsapp: lead.whatsapp,
        localizacao: lead.localizacao,
        servico: lead.servico,
        email: lead.email,
        cep: lead.cep,
        concessionaria: lead.concessionaria,
        valor_conta: lead.valor_conta,
        observacoes: lead.observacoes,
        valor_fechado: lead.valor_fechado,
        valor_proposta: lead.valor_proposta,
        temperatura: lead.temperatura,
        motivo_perda: lead.motivo_perda,
        data_proximo_contato: lead.data_proximo_contato,
        status: lead.status
      })
      .eq('id', lead.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead details in database:', error);
      throw new Error(error.message);
    }

    revalidatePath('/admin');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao salvar os detalhes do lead' };
  }
}

/**
 * Creates a new lead from the admin dashboard (requires admin session).
 */
export async function createLeadFromAdminAction(leadData: Omit<Lead, 'id' | 'created_at'>) {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      console.error('Error creating lead from admin in database:', error);
      throw new Error(error.message);
    }

    revalidatePath('/admin');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao cadastrar o lead' };
  }
}
