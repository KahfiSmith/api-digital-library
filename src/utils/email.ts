import { logger } from '@/utils/logger';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';

  if (!host || !port) {
    return null;
  }

  // Lazy require to avoid compile-time dependency during build without install
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodemailer = require('nodemailer');
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user || pass ? { user, pass } : undefined,
  });
}

export async function sendMail(options: MailOptions): Promise<void> {
  const from = process.env.SMTP_FROM || 'no-reply@localhost';
  const transport = createTransport();
  if (!transport) {
    // Fallback to logging in development
    logger.warn('SMTP not configured. Printing email to logs.');
    logger.info({ mail: { from, ...options } });
    return;
  }
  try {
    await transport.sendMail({ from, to: options.to, subject: options.subject, html: options.html });
  } catch (err) {
    logger.error('Failed to send email', err as any);
  }
}

export function verificationEmailTemplate(link: string): string {
  return `
  <div style="font-family: Arial, sans-serif;">
    <h2>Verify your email</h2>
    <p>Click the link below to verify your email address:</p>
    <p><a href="${link}">${link}</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  </div>`;
}

export function resetEmailTemplate(link: string): string {
  return `
  <div style="font-family: Arial, sans-serif;">
    <h2>Reset your password</h2>
    <p>Click the link below to set a new password:</p>
    <p><a href="${link}">${link}</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  </div>`;
}
