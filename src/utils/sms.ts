import { Company } from '../types';

export interface SendSMSOptions {
  company: Company;
  to: string;
  message: string;
}

export async function sendSMS({ company, to, message }: SendSMSOptions): Promise<{ success: boolean; message: string }> {
  const provider = company.smsProvider || 'Twilio';
  const apiKey = company.smsApiKey?.trim();
  const apiSecret = company.smsApiSecret?.trim();
  const senderId = company.smsSenderId?.trim() || 'CORE360';

  if (!apiKey) {
    console.log(`[SMS SIMULATED to ${to}]: ${message}`);
    return {
      success: true,
      message: `SMS Simulated (No live API Key configured). Target: ${to}`
    };
  }

  try {
    if (provider === 'Arkesel') {
      const url = `https://sms.arkesel.com/sms/api?action=send-sms&api_key=${encodeURIComponent(apiKey)}&to=${encodeURIComponent(to)}&from=${encodeURIComponent(senderId)}&sms=${encodeURIComponent(message)}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, message: 'SMS successfully sent via Arkesel Gateway' };
      } else {
        return { success: false, message: data.message || 'Arkesel API rejected dispatch' };
      }
    }

    if (provider === 'Hubtel') {
      const url = `https://smsc.hubtel.com/v1/messages/send?clientid=${encodeURIComponent(apiSecret || '')}&clientsecret=${encodeURIComponent(apiKey)}&from=${encodeURIComponent(senderId)}&to=${encodeURIComponent(to)}&content=${encodeURIComponent(message)}`;
      const res = await fetch(url);
      if (res.ok) {
        return { success: true, message: 'SMS successfully sent via Hubtel SMS' };
      } else {
        return { success: false, message: 'Hubtel API error' };
      }
    }

    // Default API / Backend relay proxy
    const res = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey, apiSecret, senderId, to, message })
    });

    if (res.ok) {
      return { success: true, message: `SMS sent via ${provider}` };
    } else {
      return { success: false, message: `Failed to dispatch SMS via ${provider}` };
    }
  } catch (err: any) {
    console.error('SMS Dispatch Error:', err);
    return { success: false, message: err.message || 'Network error during SMS dispatch' };
  }
}
