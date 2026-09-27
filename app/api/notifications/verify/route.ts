import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const type = (searchParams.get('type') || 'email').toLowerCase();

    if (!token) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <title>Verification Error - Vanguard ERP</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #f8fafc; color: #0f172a; }
              .card { background: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: center; max-width: 420px; width: 90%; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
              .icon { width: 56px; height: 56px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; font-weight: bold; }
              h1 { font-size: 18px; font-weight: 700; margin: 0 0 8px; }
              p { font-size: 13px; color: #64748b; margin: 0; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">✕</div>
              <h1>Invalid Verification Request</h1>
              <p>Missing or invalid verification token. Please request a new verification link.</p>
            </div>
          </body>
        </html>`,
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // Decode token payload
    let payload: any = null;
    try {
      const decodedStr = Buffer.from(token, 'base64url').toString('utf8');
      payload = JSON.parse(decodedStr);
    } catch (e) {
      // fallback base64
      try {
        const decodedStr = Buffer.from(token, 'base64').toString('utf8');
        payload = JSON.parse(decodedStr);
      } catch (err) {}
    }

    if (!payload || !payload.empId) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <title>Verification Error - Vanguard ERP</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #f8fafc; color: #0f172a; }
              .card { background: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: center; max-width: 420px; width: 90%; }
              .icon { width: 56px; height: 56px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
              h1 { font-size: 18px; font-weight: 700; margin: 0 0 8px; }
              p { font-size: 13px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">✕</div>
              <h1>Expired or Corrupt Token</h1>
              <p>The verification link has expired or is invalid. Please request a new verification dispatch.</p>
            </div>
          </body>
        </html>`,
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const { empId, tenantId = '00000000-0000-0000-0000-000000000001', recipient } = payload;
    const isEmail = type === 'email';

    // Update Supabase Record: set verified = true and approved = true
    try {
      const supabase = getSupabaseServerClient();
      const { data: tenant } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', tenantId)
        .maybeSingle();

      const existingFlags = tenant?.feature_flags || {};
      const prefsList = Array.isArray(existingFlags.employee_notification_preferences)
        ? [...existingFlags.employee_notification_preferences]
        : [];

      let found = false;
      const updatedPrefs = prefsList.map((emp: any) => {
        if (emp.id === empId || emp.email === recipient || emp.phone === recipient) {
          found = true;
          if (isEmail) {
            return {
              ...emp,
              emailVerified: true,
              emailApproved: true,
              verified: true,
              approved: true,
            };
          } else {
            return {
              ...emp,
              phoneVerified: true,
              phoneApproved: true,
              verified: true,
              approved: true,
            };
          }
        }
        return emp;
      });

      // If not yet in list, insert employee record
      if (!found) {
        updatedPrefs.push({
          id: empId,
          name: payload.name || 'Verified Employee',
          department: 'Management',
          email: isEmail ? recipient : '',
          emailVerified: isEmail,
          emailApproved: isEmail,
          phone: !isEmail ? recipient : '',
          phoneVerified: !isEmail,
          phoneApproved: !isEmail,
          receiveEmailAlerts: isEmail,
          receiveWhatsAppAlerts: !isEmail,
          alertEndOfDay: true,
          alertItemExpiry: true,
          alertLowStock: true,
          verified: true,
          approved: true,
        });
      }

      await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...existingFlags,
            employee_notification_preferences: updatedPrefs,
            last_verification_event: {
              empId,
              type,
              recipient,
              timestamp: new Date().toISOString(),
            },
          },
        })
        .eq('id', tenantId);

      // Also attempt update in public.employees if table exists
      try {
        if (isEmail) {
          await supabase.from('employees').update({ verified: true, approved: true }).eq('email', recipient);
        } else {
          await supabase.from('employees').update({ verified: true, approved: true }).eq('phone', recipient);
        }
      } catch (e) {}
    } catch (dbErr: any) {
      console.warn('[Verify API] Database update warning:', dbErr.message);
    }

    // Required Minimalist Confirmation Page Layout
    const confirmationText = isEmail
      ? 'Email has been verified. You may close this page now.'
      : 'Employee phone has been verified. You may close this page now.';

    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <title>Verification Confirmed - Vanguard ERP</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 24px;
              background-color: #f8fafc;
              color: #0f172a;
            }
            .container {
              background: #ffffff;
              padding: 48px 36px;
              border-radius: 28px;
              border: 1px solid #e2e8f0;
              text-align: center;
              max-width: 440px;
              width: 100%;
              box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);
            }
            .badge-facility {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 14px;
              border-radius: 9999px;
              background-color: #eff6ff;
              color: #1e40af;
              font-size: 11px;
              font-weight: 700;
              margin-bottom: 24px;
              border: 1px solid #dbeafe;
            }
            .check-circle {
              width: 64px;
              height: 64px;
              border-radius: 50%;
              background-color: #ecfdf5;
              color: #059669;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
              box-shadow: 0 0 0 8px #f0fdf4;
            }
            .check-icon {
              width: 32px;
              height: 32px;
              stroke: currentColor;
              stroke-width: 3;
              fill: none;
              stroke-linecap: round;
              stroke-linejoin: round;
            }
            h1 {
              font-size: 19px;
              font-weight: 800;
              color: #0f172a;
              line-height: 1.4;
              margin: 0 0 12px;
              letter-spacing: -0.01em;
            }
            p.subtext {
              font-size: 13px;
              color: #64748b;
              margin: 0 0 28px;
              line-height: 1.5;
            }
            .footer-tag {
              font-size: 11px;
              font-weight: 600;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border-top: 1px solid #f1f5f9;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="badge-facility">
              <span>🏢</span>
              <span>Zeit w zaytoun ljanoub (Facility ID: #1300)</span>
            </div>

            <div class="check-circle">
              <svg class="check-icon" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h1>${confirmationText}</h1>
            <p class="subtext">
              Your notifications profile in Vanguard ERP is now active and approved for automated alerts.
            </p>

            <div class="footer-tag">
              Vanguard ERP • Enterprise Communications Engine
            </div>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/notifications/verify GET] Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
