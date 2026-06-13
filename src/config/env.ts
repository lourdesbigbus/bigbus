/**
 * Centralized and validated environment variables
 */

export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5548999999999',
  nodeEnv: process.env.NODE_ENV || 'development',
};

/**
 * Validates Supabase configurations on execution
 */
export function validateSupabaseConfig() {
  const { url, anonKey } = env.supabase;
  if (!url || !anonKey || url.includes('placeholder') || (url.includes('.supabase.co') === false && url.includes('localhost') === false && url.includes('127.0.0.1') === false)) {
    console.warn('⚠️ Supabase credentials might not be configured correctly in .env.local');
    return false;
  }
  return true;
}
