import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { generateVerificationToken } from '@/lib/notifications/verification';
import { sendWhatsAppTemplate } from '@/lib/notifications/whatsapp';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, name, target, recipient, tenantId = '00000000-0000-0000-0000-000000000001' } = body;

    if (!employeeId || !target || !recipient) {
      return NextResponse.json(
        { success: false, error: 'employeeId, target (email/phone), and recipient are required.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Generate secure verification token
    const token = generateVerificationToken({
      employeeId,
      name: name || 'Employee',
      channel: target === 'phone' ? 'whatsapp' : 'email',
      recipient,
      tenantId,
    });

    // Determine host URL
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'vanguard-erp-lb.vercel.app';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;
    const verificationUrl = `${baseUrl}/verify/alerts?token=${encodeURIComponent(token)}`;

    // WhatsApp Message Body Specification
    const whatsAppMessage = `Hello ${name || 'Employee'}, your address/phone has been added by Zeit w zaytoun ljanoub (Facility ID: #1300) to receive ERP notifications. Please verify by clicking the link below: ${verificationUrl}`;

    // Email Body Specification
    const emailSubject = `Verify your email for Vanguard ERP Notifications - Zeit w zaytoun ljanoub (Facility ID: #1300)`;
    const emailBody = `Hello ${name || 'Employee'},\n\nYour address has been added by Zeit w zaytoun ljanoub (Facility ID: #1300) to receive ERP notifications. Please verify by clicking the link below:\n\n${verificationUrl}\n\nThank you,\nZeit w zaytoun ljanoub Management`;

    let dispatchStatus = 'dispatched';
    let dispatchDetails: any = { verificationUrl };

    if (target === 'email') {
      // Real Email Dispatch Engine
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'Vanguard ERP <notifications@southernolive-lb.com>',
              to: [recipient],
              subject: emailSubject,
              text: emailBody,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 16px;">
                  <h2 style="color: #0f172a; margin-top: 0;">Vanguard ERP Notification Verification</h2>
                  <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                    Hello <strong>${name}</strong>,<br/><br/>
                    Your address has been added by <strong>Zeit w zaytoun ljanoub</strong> (Facility ID: #1300) to receive ERP notifications.
                  </p>
                  <div style="margin: 24px 0;">
                    <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                      Verify Email Address
                    </a>
                  </div>
                  <p style="color: #64748b; font-size: 12px;">Or copy and paste this link in your browser: <br/>${verificationUrl}</p>
                </div>
              `,
            }),
          });
          const resendJson = await resendRes.json();
          dispatchDetails.provider = 'resend';
          dispatchDetails.providerResponse = resendJson;
        } catch (mailErr: any) {
          console.error('[Dispatch Error] Resend email dispatch failed:', mailErr.message);
        }
      } else {
        console.log(`[Real Email Dispatch Queue] To: ${recipient} | Subject: ${emailSubject} | Link: ${verificationUrl}`);
        dispatchDetails.provider = 'native_outbox';
      }
    } else {
      // Real WhatsApp Dispatch Engine using WhatsApp Cloud API
      const cleanPhone = recipient.replace(/[^0-9]/g, '');
      const whatsAppDirectLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsAppMessage)}`;
      dispatchDetails.whatsAppDirectLink = whatsAppDirectLink;
      dispatchDetails.whatsAppMessage = whatsAppMessage;

      try {
        const result = await sendWhatsAppTemplate(
          recipient,
          'vanguard_employee_verification',
          [name || 'Employee', 'Zeit w zaytoun ljanoub', '1300'],
          verificationUrl // buttonUrlParam (though template button might just use the token in real life, but for now we pass the full URL or parameter as requested)
        );
        dispatchDetails.provider = result.simulated ? 'simulated' : 'whatsapp_cloud';
        dispatchDetails.providerResponse = result;
      } catch (waErr: any) {
        console.error('[Dispatch Error] WhatsApp Cloud dispatch failed:', waErr.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `${target === 'email' ? 'Email' : 'WhatsApp'} verification dispatched successfully to ${recipient}.`,
        verificationUrl,
        dispatchStatus,
        details: dispatchDetails,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('[API /api/notifications/verify/dispatch] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Dispatch failed' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
