import { Company } from '../types';

export interface SendEmailOptions {
  company: Company;
  to: string;
  subject: string;
  htmlBody: string;
}

export async function sendEmail({ company, to, subject, htmlBody }: SendEmailOptions): Promise<{ success: boolean; message: string }> {
  const provider = company.emailProvider || 'SMTP';
  const apiKey = company.emailApiKey?.trim();
  const host = company.smtpHost?.trim();
  const fromEmail = company.emailFromAddress?.trim() || 'noreply@company.com';
  const fromName = company.emailFromName?.trim() || company.name || 'CORE360';

  if (!apiKey && !host) {
    console.log(`[EMAIL SIMULATED to ${to}]: Subject="${subject}"`);
    return {
      success: true,
      message: `Email Simulated (No live SMTP or API Key configured). Recipient: ${to}`
    };
  }

  try {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        host,
        port: company.smtpPort || 587,
        username: company.smtpUsername,
        password: company.smtpPassword,
        apiKey,
        fromEmail,
        fromName,
        to,
        subject,
        htmlBody
      })
    });

    if (res.ok) {
      return { success: true, message: `Email successfully sent to ${to} via ${provider}` };
    } else {
      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.message || `Failed to send email via ${provider}` };
    }
  } catch (err: any) {
    console.error('Email Dispatch Error:', err);
    return { success: false, message: err.message || 'Network error during email dispatch' };
  }
}
