"use server";

import { supabaseAdmin } from '@/lib/supabase-admin';
import { Company } from '@/types';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';
import { revalidatePath } from 'next/cache';

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
 * Fetch all homologated companies. Available publicly or for admin.
 */
export async function getCompaniesAction(): Promise<{ success: boolean; data?: Company[]; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'companies')
      .maybeSingle();

    if (error) {
      console.error('Error fetching companies:', error);
      throw new Error(error.message);
    }

    const list: Company[] = data ? (data.value as Company[]) : [];
    return { success: true, data: list };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar empresas.' };
  }
}

/**
 * Creates or updates a company. Admin only.
 */
export async function saveCompanyAction(company: Company): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    // Load existing list
    const res = await getCompaniesAction();
    if (!res.success) {
      throw new Error(res.error || 'Erro ao carregar a lista de empresas.');
    }

    const currentList = res.data || [];
    const index = currentList.findIndex(c => c.id === company.id);

    if (index >= 0) {
      // Update
      currentList[index] = company;
    } else {
      // Insert
      currentList.push(company);
    }

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key: 'companies', value: currentList });

    if (error) {
      console.error('Error saving company:', error);
      throw new Error(error.message);
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao salvar a empresa.' };
  }
}

/**
 * Deletes a company. Admin only.
 */
export async function deleteCompanyAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    // Load existing list
    const res = await getCompaniesAction();
    if (!res.success) {
      throw new Error(res.error || 'Erro ao carregar a lista de empresas.');
    }

    const filteredList = (res.data || []).filter(c => c.id !== id);

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key: 'companies', value: filteredList });

    if (error) {
      console.error('Error deleting company:', error);
      throw new Error(error.message);
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao excluir a empresa.' };
  }
}
