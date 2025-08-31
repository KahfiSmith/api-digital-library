import * as emailUtil from '@/utils/email';
import { prisma } from '@/database/prisma';
import { logger } from '@/utils/logger';
import { NotificationType } from '@/types/enums';

export interface EmailNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
}

export async function sendDueDateReminders(): Promise<number> {
  try {
    // Find loans due in the next 2 days
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    const upcomingDueLoans = await prisma.bookLoan.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: {
          gte: new Date(),
          lte: twoDaysFromNow
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            emailVerified: true
          }
        },
        book: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    const emails = upcomingDueLoans
      .filter(loan => loan.user.emailVerified) // Only send to verified emails
      .map(loan => ({
        to: loan.user.email,
        subject: `📚 Book Due Reminder: ${loan.book.title}`,
        html: emailUtil.dueDateReminderTemplate(
          loan.book.title,
          loan.dueDate.toLocaleDateString(),
          `${loan.user.firstName} ${loan.user.lastName}`
        )
      }));

    if (emails.length > 0) {
      const result = await emailUtil.sendBulkMail(emails);
      logger.info(`Sent ${result.success} due date reminders, ${result.failed} failed`);
      return result.success;
    }

    return 0;
  } catch (error) {
    logger.error('Error sending due date reminders:', error);
    return 0;
  }
}

export async function sendOverdueNotifications(): Promise<number> {
  try {
    const overdueLoans = await prisma.bookLoan.findMany({
      where: {
        status: 'OVERDUE',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            emailVerified: true
          }
        },
        book: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    const emails = overdueLoans
      .filter(loan => loan.user.emailVerified)
      .map(loan => ({
        to: loan.user.email,
        subject: `⚠️ Overdue Book: ${loan.book.title}`,
        html: emailUtil.overdueBookTemplate(
          loan.book.title,
          loan.dueDate.toLocaleDateString(),
          `${loan.user.firstName} ${loan.user.lastName}`,
          loan.fineAmount
        )
      }));

    if (emails.length > 0) {
      const result = await emailUtil.sendBulkMail(emails);
      logger.info(`Sent ${result.success} overdue notifications, ${result.failed} failed`);
      return result.success;
    }

    return 0;
  } catch (error) {
    logger.error('Error sending overdue notifications:', error);
    return 0;
  }
}

export async function sendNewBookNotifications(bookId: string): Promise<number> {
  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    if (!book) return 0;

    // Find users who have this category in their wishlist or favorites
    const interestedUsers = await prisma.user.findMany({
      where: {
        emailVerified: true,
        isActive: true,
        bookLists: {
          some: {
            book: {
              categoryId: book.categoryId
            },
            listType: {
              in: ['WISHLIST', 'FAVORITES']
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      },
      distinct: ['id'] // Avoid duplicate users
    });

    const emails = interestedUsers.map(user => ({
      to: user.email,
      subject: `🎉 New Book Available: ${book.title}`,
      html: emailUtil.newBookAvailableTemplate(
        book.title,
        book.category.name,
        `${user.firstName} ${user.lastName}`
      )
    }));

    if (emails.length > 0) {
      const result = await emailUtil.sendBulkMail(emails);
      logger.info(`Sent ${result.success} new book notifications for "${book.title}", ${result.failed} failed`);
      return result.success;
    }

    return 0;
  } catch (error) {
    logger.error('Error sending new book notifications:', error);
    return 0;
  }
}

export async function sendReservationReadyNotification(reservationId: string): Promise<boolean> {
  try {
    const reservation = await (prisma as any).bookReservation.findUnique({
      where: { id: reservationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            emailVerified: true
          }
        },
        book: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!reservation || !reservation.user.emailVerified) return false;

    const email = {
      to: reservation.user.email,
      subject: `📖 Your Reserved Book is Ready: ${reservation.book.title}`,
      html: emailUtil.reservationReadyTemplate(
        reservation.book.title,
        `${reservation.user.firstName} ${reservation.user.lastName}`,
        reservation.expiresAt.toLocaleDateString()
      )
    };

    await emailUtil.sendMail(email);
    logger.info(`Sent reservation ready notification to ${reservation.user.email}`);
    return true;
  } catch (error) {
    logger.error('Error sending reservation ready notification:', error);
    return false;
  }
}

export async function sendSystemAnnouncement(title: string, message: string, targetUserIds?: string[]): Promise<number> {
  try {
    const whereClause = {
      emailVerified: true,
      isActive: true,
      ...(targetUserIds && { id: { in: targetUserIds } })
    };

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    const emails = users.map(user => ({
      to: user.email,
      subject: `📢 ${title}`,
      html: emailUtil.systemAnnouncementTemplate(
        title,
        message,
        `${user.firstName} ${user.lastName}`
      )
    }));

    if (emails.length > 0) {
      const result = await emailUtil.sendBulkMail(emails);
      logger.info(`Sent ${result.success} system announcements, ${result.failed} failed`);
      return result.success;
    }

    return 0;
  } catch (error) {
    logger.error('Error sending system announcement:', error);
    return 0;
  }
}

export async function sendWelcomeEmail(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true
      }
    });

    if (!user || !user.emailVerified) return false;

    const welcomeMessage = `
      <p>Welcome to our Digital Library! We're excited to have you join our community.</p>
      <p>Here's what you can do with your account:</p>
      <ul>
        <li>📚 Browse and search our extensive book collection</li>
        <li>⭐ Leave reviews and ratings for books</li>
        <li>📋 Create reading lists and wishlists</li>
        <li>🔔 Get notified about new books and due dates</li>
        <li>📖 Reserve books when they're not available</li>
      </ul>
      <p>Start exploring our library today and discover your next favorite book!</p>
    `;

    const email = {
      to: user.email,
      subject: 'Welcome to Digital Library! 🎉',
      html: emailUtil.systemAnnouncementTemplate(
        'Welcome to Digital Library!',
        welcomeMessage,
        `${user.firstName} ${user.lastName}`
      )
    };

    await emailUtil.sendMail(email);
    logger.info(`Sent welcome email to ${user.email}`);
    return true;
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    return false;
  }
}

// Daily email task runner
export async function runDailyEmailTasks(): Promise<void> {
  logger.info('Starting daily email tasks...');
  
  try {
    const [remindersSent, overduesSent] = await Promise.all([
      sendDueDateReminders(),
      sendOverdueNotifications()
    ]);
    
    logger.info(`Daily email tasks completed: ${remindersSent} reminders, ${overduesSent} overdue notifications sent`);
  } catch (error) {
    logger.error('Error running daily email tasks:', error);
  }
}

// Email settings and preferences (future enhancement)
export async function getUserEmailPreferences(userId: string) {
  // This could be expanded to include user preferences for different types of emails
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      emailVerified: true,
      // Could add emailPreferences field in future
    }
  });

  return {
    emailVerified: user?.emailVerified || false,
    dueDateReminders: true, // Default preferences
    overdueNotifications: true,
    newBookAlerts: true,
    systemAnnouncements: true
  };
}

export async function testEmailConfiguration(): Promise<boolean> {
  try {
    const testEmail = {
      to: process.env.TEST_EMAIL || 'test@example.com',
      subject: 'Test Email Configuration',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Test Email</h2>
          <p>This is a test email to verify SMTP configuration.</p>
          <p>Time: ${new Date().toISOString()}</p>
        </div>
      `
    };

    await emailUtil.sendMail(testEmail);
    logger.info('Test email sent successfully');
    return true;
  } catch (error) {
    logger.error('Failed to send test email:', error);
    return false;
  }
}