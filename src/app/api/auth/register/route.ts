import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.NEXT_RESEND_API_KEY);
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { email, password, name, phone } = await req.json();

    // Generate confirmation link (this also creates the user if they don't exist)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        redirectTo: `${new URL(req.url).origin}/login`,
        data: { 
          full_name: name,
          phone: phone || null
        }
      }
    });

    if (linkError) throw linkError;

    const confirmationURL = linkData.properties.action_link;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 40px; background: #ffffff; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
        .logo { font-size: 28px; font-weight: 800; color: #6366f1; margin-bottom: 24px; text-align: center; letter-spacing: -1px; }
        h1 { font-size: 24px; font-weight: 700; color: #111; margin-bottom: 16px; text-align: center; }
        p { margin-bottom: 20px; font-size: 16px; color: #555; text-align: center; }
        .btn-container { text-align: center; margin: 40px 0; }
        .button { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white !important; padding: 16px 36px; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); transition: all 0.3s ease; display: inline-block; }
        .footer { font-size: 12px; color: #999; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Hisheb</div>
        <h1>Verify your email</h1>
        <p>Welcome to Hisheb! Your personal financial compass. Please click the button below to verify your account and start tracking your expenses.</p>
        
        <div class="btn-container">
            <a href="${confirmationURL}" class="button">Confirm My Account</a>
        </div>
        
        <p style="font-size: 14px; opacity: 0.7;">If you didn't create an account, you can safely ignore this email.</p>
        
        <div class="footer">
            &copy; 2026 Hisheb Finance App. All rights reserved.
        </div>
    </div>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: 'Hisheb <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email - Hisheb',
      html: html,
    });

    if (emailResponse.error) {
      console.error('Resend Error:', emailResponse.error);
      throw new Error(`Email failed: ${emailResponse.error.message}`);
    }

    console.log('Email sent successfully:', emailResponse.data);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Signup error detail:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
