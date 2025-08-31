import { logger } from '@/utils/logger';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string;
  bcc?: string;
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

// Notification email templates
export function dueDateReminderTemplate(bookTitle: string, dueDate: string, userName: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
      <h2 style="color: #333; margin-bottom: 20px;">📚 Book Due Date Reminder</h2>
      <p>Dear ${userName},</p>
      <p>This is a friendly reminder that your borrowed book is due soon:</p>
      
      <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
        <strong>Book:</strong> ${bookTitle}<br>
        <strong>Due Date:</strong> ${dueDate}
      </div>
      
      <p>Please return the book by the due date to avoid any late fees.</p>
      <p>Thank you for using our Digital Library!</p>
    </div>
  </div>`;
}

export function overdueBookTemplate(bookTitle: string, dueDate: string, userName: string, fineAmount?: number): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; border: 1px solid #ffeaa7;">
      <h2 style="color: #856404; margin-bottom: 20px;">⚠️ Overdue Book Notice</h2>
      <p>Dear ${userName},</p>
      <p>Your borrowed book is now overdue:</p>
      
      <div style="background-color: white; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
        <strong>Book:</strong> ${bookTitle}<br>
        <strong>Was Due:</strong> ${dueDate}<br>
        ${fineAmount ? `<strong>Current Fine:</strong> $${fineAmount.toFixed(2)}<br>` : ''}
      </div>
      
      <p>Please return the book as soon as possible to minimize additional fees.</p>
      <p>Contact the library if you need assistance.</p>
    </div>
  </div>`;
}

export function newBookAvailableTemplate(bookTitle: string, categoryName: string, userName: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #d1ecf1; padding: 20px; border-radius: 5px; border: 1px solid #bee5eb;">
      <h2 style="color: #0c5460; margin-bottom: 20px;">🎉 New Book Available</h2>
      <p>Dear ${userName},</p>
      <p>Great news! A new book in your interest area has been added to our library:</p>
      
      <div style="background-color: white; padding: 15px; border-left: 4px solid #17a2b8; margin: 20px 0;">
        <strong>Book:</strong> ${bookTitle}<br>
        <strong>Category:</strong> ${categoryName}
      </div>
      
      <p>This book is now available for borrowing. Visit our library to check it out!</p>
      <p>Happy reading!</p>
    </div>
  </div>`;
}

export function reservationReadyTemplate(bookTitle: string, userName: string, expiryDate: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; border: 1px solid #c3e6cb;">
      <h2 style="color: #155724; margin-bottom: 20px;">📖 Your Reserved Book is Ready!</h2>
      <p>Dear ${userName},</p>
      <p>Good news! Your reserved book is now available for pickup:</p>
      
      <div style="background-color: white; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
        <strong>Book:</strong> ${bookTitle}<br>
        <strong>Available Until:</strong> ${expiryDate}
      </div>
      
      <p>Please visit the library within 24 hours to collect your reserved book.</p>
      <p>If you cannot collect it by the expiry date, your reservation will be automatically cancelled.</p>
    </div>
  </div>`;
}

export function systemAnnouncementTemplate(title: string, message: string, userName: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #dee2e6;">
      <h2 style="color: #495057; margin-bottom: 20px;">📢 ${title}</h2>
      <p>Dear ${userName},</p>
      
      <div style="background-color: white; padding: 20px; border-radius: 3px; margin: 20px 0; line-height: 1.6;">
        ${message}
      </div>
      
      <p>Thank you for being part of our Digital Library community!</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <small style="color: #6c757d;">This is a system announcement from Digital Library Management</small>
    </div>
  </div>`;
}

// Bulk email sending function
export async function sendBulkMail(emails: MailOptions[]): Promise<{success: number, failed: number}> {
  let success = 0;
  let failed = 0;
  
  const batchSize = 50; // Send emails in batches to avoid overwhelming SMTP server
  const batches = [];
  
  for (let i = 0; i < emails.length; i += batchSize) {
    batches.push(emails.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    const promises = batch.map(async (email) => {
      try {
        await sendMail(email);
        success++;
      } catch (error) {
        failed++;
        logger.error(`Failed to send email to ${email.to}:`, error);
      }
    });
    
    await Promise.allSettled(promises);
    
    // Add a small delay between batches to be nice to SMTP server
    if (batches.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  logger.info(`Bulk email send completed: ${success} successful, ${failed} failed`);
  return { success, failed };
}
