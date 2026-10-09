export interface WhatsAppTemplateConfig {
  name: string;
  language: string;
}

export const TEMPLATES = {
  vanguard_employee_verification: {
    name: 'vanguard_employee_verification',
    language: 'en_US',
  },
  vanguard_low_stock_alert: {
    name: 'vanguard_low_stock_alert',
    language: 'en_US',
  },
  vanguard_daily_summary: {
    name: 'vanguard_daily_summary',
    language: 'en_US',
  },
};

export async function sendWhatsAppTemplate(
  toPhone: string,
  templateName: string,
  bodyVariables: string[],
  buttonUrlParam?: string
) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_ID;

  if (!token || !phoneNumberId) {
    console.warn('[WhatsApp Dispatcher] Missing META_WHATSAPP_TOKEN or META_WHATSAPP_PHONE_ID. Simulating dispatch.');
    console.log(`[Simulated WhatsApp] To: ${toPhone} | Template: ${templateName} | Vars: ${bodyVariables} | Button: ${buttonUrlParam}`);
    return { success: true, simulated: true };
  }

  const cleanPhone = toPhone.replace(/[^0-9]/g, '');

  const templateConfig = (Object.values(TEMPLATES).find(t => t.name === templateName)) || { name: templateName, language: 'en_US' };

  const components: any[] = [];

  if (bodyVariables && bodyVariables.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyVariables.map((text) => ({ type: 'text', text })),
    });
  }

  if (buttonUrlParam) {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [
        {
          type: 'text',
          text: buttonUrlParam,
        },
      ],
    });
  }

  const body = {
    messaging_product: 'whatsapp',
    to: cleanPhone,
    type: 'template',
    template: {
      name: templateConfig.name,
      language: {
        code: templateConfig.language,
      },
      components: components.length > 0 ? components : undefined,
    },
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'WhatsApp Cloud API Error');
    }

    return { success: true, data: json };
  } catch (error: any) {
    console.error('[WhatsApp Dispatcher Error]', error.message);
    throw error;
  }
}
