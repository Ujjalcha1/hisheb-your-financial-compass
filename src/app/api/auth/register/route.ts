import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { email, password, name, phone } = await req.json();

    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        full_name: name,
        phone: phone || null
      }
    });

    if (createError) throw createError;

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error('Signup error detail:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
