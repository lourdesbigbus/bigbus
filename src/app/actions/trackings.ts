"use server";

import { supabaseAdmin } from '@/lib/supabase-admin';
import { ServiceTracking } from '@/types';
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
 * Fetch all service trackings. Available for admin.
 */
export async function getTrackingsAction(): Promise<{ success: boolean; data?: ServiceTracking[]; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'service_trackings')
      .maybeSingle();

    if (error) {
      console.error('Error fetching trackings:', error);
      throw new Error(error.message);
    }

    const list: ServiceTracking[] = data ? (data.value as ServiceTracking[]) : [];
    return { success: true, data: list };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar acompanhamentos.' };
  }
}

/**
 * Creates or updates a service tracking. Admin only.
 */
export async function saveTrackingAction(tracking: ServiceTracking): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    // Load existing list
    const res = await getTrackingsAction();
    if (!res.success) {
      throw new Error(res.error || 'Erro ao carregar a lista de acompanhamentos.');
    }

    const currentList = res.data || [];
    const index = currentList.findIndex(t => t.id === tracking.id);

    if (index >= 0) {
      // Update
      currentList[index] = tracking;
    } else {
      // Insert
      currentList.push(tracking);
    }

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key: 'service_trackings', value: currentList });

    if (error) {
      console.error('Error saving tracking:', error);
      throw new Error(error.message);
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao salvar o acompanhamento.' };
  }
}

/**
 * Deletes a service tracking. Admin only.
 */
export async function deleteTrackingAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    // Load existing list
    const res = await getTrackingsAction();
    if (!res.success) {
      throw new Error(res.error || 'Erro ao carregar a lista de acompanhamentos.');
    }

    const filteredList = (res.data || []).filter(t => t.id !== id);

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key: 'service_trackings', value: filteredList });

    if (error) {
      console.error('Error deleting tracking:', error);
      throw new Error(error.message);
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao excluir o acompanhamento.' };
  }
}
