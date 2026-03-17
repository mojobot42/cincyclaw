export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { email } = await context.request.json();
    
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const timestamp = new Date().toISOString();
    const RESEND_API_KEY = context.env.RESEND_API_KEY;

    // 1. Send welcome email from info@cincyclaw.com
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CincyClaw <info@cincyclaw.com>',
        to: email,
        subject: 'Welcome to CincyClaw — Let\'s Talk About Your Business',
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #f97316;">🦀 Welcome to CincyClaw!</h2>
            <p>Hey there,</p>
            <p>Thank you for signing up for early access. You're one of the first to explore what AI agents can do for Cincinnati businesses — and we're excited to connect with you.</p>
            <p>One of our team members will be in touch shortly. In the meantime, we'd love to learn more about you:</p>
            <p style="background: #f8f8f8; padding: 16px; border-left: 3px solid #f97316; border-radius: 4px;">
              <strong>Can you tell us a little about your business and what pain points or bold ideas the CincyClaw team can help you solve?</strong>
            </p>
            <p>Just hit reply — this goes straight to our team.</p>
            <p>Talk soon,<br><strong>The CincyClaw Team</strong></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="font-size: 12px; color: #999;">CincyClaw — AI agents for Cincinnati businesses.<br>Powered by OpenClaw + NVIDIA NemoClaw.</p>
          </div>
        `,
        reply_to: 'mojobot42@gmail.com',
      }),
    });

    // 2. Notify mojobot42@gmail.com about the new signup
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CincyClaw Signups <info@cincyclaw.com>',
        to: 'mojobot42@gmail.com',
        subject: `🦀 New CincyClaw Signup: ${email}`,
        html: `<p>New signup at ${timestamp}</p><p><strong>Email:</strong> ${email}</p>`,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
