export async function sendWhatsAppTemplate(
  toPhone: string,
  templateName: string,
  variables: string[],
  buttonUrlParam?: string
) {
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const WHATSAPP_SYSTEM_TOKEN = process.env.WHATSAPP_SYSTEM_TOKEN;

  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_SYSTEM_TOKEN) {
    console.log(`[SIMULATED WHATSAPP] To: ${toPhone} | Template: ${templateName}`);
    return { simulated: true, toPhone, templateName, variables };
  }

  const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  let components: any[] = [];
  
  if (variables.length > 0) {
    components.push({
      type: 'body',
      parameters: variables.map(v => ({ type: 'text', text: v }))
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
          text: buttonUrlParam
        }
      ]
    });
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: toPhone.replace(/[^0-9]/g, ''),
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'en_US'
      },
      components: components.length > 0 ? components : undefined
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_SYSTEM_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to send WhatsApp template');
  }

  return data;
}

export async function sendLowStockAlert(toPhone: string) {
  return sendWhatsAppTemplate(toPhone, 'vanguard_low_stock', [], ''); 
}

export async function sendDailySummary(toPhone: string) {
  return sendWhatsAppTemplate(toPhone, 'vanguard_daily_summary', [], '');
}
