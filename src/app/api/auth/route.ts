import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateToken } from '@/lib/auth-token';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const adminEmailEnv = process.env.ADMIN_EMAIL || 'admin@hubly.com';
    const adminPasswordEnv = process.env.ADMIN_PASSWORD || 'hublypro123';

    // 1. Tentar carregar as credenciais do banco
    const { data: dbCreds } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_credentials')
      .maybeSingle();

    const expectedEmail = dbCreds ? dbCreds.value.email : adminEmailEnv;
    const expectedPassword = dbCreds ? dbCreds.value.password : adminPasswordEnv;

    if (email === expectedEmail && password === expectedPassword) {
      const payload = {
        role: 'admin',
        email: email,
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 dias
      };

      // Sempre usar adminPasswordEnv como a chave de assinatura JWT para compatibilidade com middleware
      const token = await generateToken(payload, adminPasswordEnv);
      const cookieStore = await cookies();
      
      cookieStore.set('hubly_admin_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 1 semana
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('hubly_admin_auth');
  return NextResponse.json({ success: true });
}
