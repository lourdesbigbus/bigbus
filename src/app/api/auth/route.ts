import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateToken } from '@/lib/auth-token';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hubly.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'hublypro123';

    if (email === adminEmail && password === adminPassword) {
      const payload = {
        role: 'admin',
        email: email,
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 dias
      };

      const token = await generateToken(payload, adminPassword);
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
