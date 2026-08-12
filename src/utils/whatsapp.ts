import { Company } from '../types';

export interface WhatsAppMessage {
  company: Company;
  to: string; // E.164 format e.g. +233240123456
  message: string;
  templateName?: string;
}

export interface WhatsAppResult {
  success: boolean;
  message: string;
  messageId?: string;
}

/**
 * Send a WhatsApp message via Meta's WhatsApp Business Cloud API.
 * Falls back to simulated mode if no API key is configured.
 */
export async function sendWhatsApp({ company, to, message }: WhatsAppMessage): Promise<WhatsAppResult> {
  const apiKey = company.whatsappApiKey;
  const phoneNumberId = company.whatsappPhoneNumberId;

  if (!apiKey || !phoneNumberId) {
    // Simulated mode
    console.log(`[WhatsApp SIMULATED] To: ${to} | Message: ${message}`);
    return { success: true, message: `WhatsApp message simulated to ${to} (no API key configured)` };
  }

  try {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\s/g, ''),
      type: 'text',
      text: { preview_url: false, body: message },
    };

    const resp = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await resp.json() as any;

    if (!resp.ok) {
      const errMsg = data?.error?.message || 'WhatsApp API error';
      return { success: false, message: errMsg };
    }

    return {
      success: true,
      message: `WhatsApp message sent to ${to}`,
      messageId: data?.messages?.[0]?.id,
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to send WhatsApp message' };
  }
}
