import { prisma } from '@/database/prisma';
import { ReservationStatus } from '@/types/enums';
import { AppError } from '@/utils/appError';

export interface CreateReservationInput {
  userId: string;
  bookId: string;
  notes?: string;
}

export interface UpdateReservationInput {
  status?: ReservationStatus;
  notes?: string;
}

export interface GetReservationsQuery {
  userId?: string;
  bookId?: string;
  status?: ReservationStatus;
  page?: number;
  limit?: number;
}

export async function create(input: CreateReservationInput) {
  const book = await prisma.book.findFirst({
    where: { id: input.bookId, isActive: true }
  });

  if (!book) {
    throw AppError.notFound('Book not found or not available');
  }

  if (book.availableCopies > 0) {
    throw AppError.badRequest('Book is currently available, no reservation needed');
  }

  const existingReservation = await (prisma as any).bookReservation.findFirst({
    where: {
      userId: input.userId,
      bookId: input.bookId,
      status: { in: ['PENDING', 'READY'] }
    }
  });

  if (existingReservation) {
    throw AppError.badRequest('You already have an active reservation for this book');
  }

  const queuePosition = await (prisma as any).bookReservation.count({
    where: {
      bookId: input.bookId,
      status: ReservationStatus.PENDING
    }
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to respond

  const reservation = await (prisma as any).bookReservation.create({
    data: {
      userId: input.userId,
      bookId: input.bookId,
      status: ReservationStatus.PENDING,
      priority: queuePosition,
      expiresAt,
      notes: input.notes,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      book: {
        select: {
          id: true,
          title: true,
          subtitle: true,
          authors: true,
          coverUrl: true,
          availableCopies: true,
          totalCopies: true
        }
      }
    }
  });

  return reservation;
}

export async function findMany(query: GetReservationsQuery) {
  const { userId, bookId, status, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...(userId && { userId }),
    ...(bookId && { bookId }),
    ...(status && { status }),
  } as any;

  const [items, total] = await Promise.all([
    (prisma as any).bookReservation.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        book: {
          select: {
            id: true,
            title: true,
            subtitle: true,
            authors: true,
            coverUrl: true,
            availableCopies: true,
            totalCopies: true
          }
        }
      }
    }),
    (prisma as any).bookReservation.count({ where }),
  ]);

  return { items, total };
}

export async function findById(id: string) {
  const reservation = await (prisma as any).bookReservation.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      book: {
        select: {
          id: true,
          title: true,
          subtitle: true,
          authors: true,
          coverUrl: true,
          availableCopies: true,
          totalCopies: true
        }
      }
    }
  });

  if (!reservation) {
    throw AppError.notFound('Reservation not found');
  }

  return reservation;
}

export async function update(id: string, input: UpdateReservationInput) {
  const reservation = await findById(id);

  const updateData = {
    ...(input.status && { status: input.status }),
    ...(input.notes !== undefined && { notes: input.notes }),
    updatedAt: new Date(),
  } as any;

  if (input.status === ReservationStatus.FULFILLED) {
    updateData.fulfilledAt = new Date();
  } else if (input.status === ReservationStatus.CANCELLED) {
    updateData.cancelledAt = new Date();
  }

  const updated = await (prisma as any).bookReservation.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      book: {
        select: {
          id: true,
          title: true,
          subtitle: true,
          authors: true,
          coverUrl: true,
          availableCopies: true,
          totalCopies: true
        }
      }
    }
  });

  // Update queue priorities if reservation was cancelled
  if (input.status === ReservationStatus.CANCELLED || input.status === ReservationStatus.EXPIRED) {
    await reorderQueue(reservation.bookId, reservation.priority);
  }

  return updated;
}

export async function cancel(id: string, userId: string) {
  const reservation = await findById(id);

  if (reservation.userId !== userId) {
    throw AppError.badRequest('You can only cancel your own reservations');
  }

  if (reservation.status === ReservationStatus.FULFILLED || reservation.status === ReservationStatus.CANCELLED) {
    throw AppError.badRequest('Cannot cancel this reservation');
  }

  return update(id, { status: ReservationStatus.CANCELLED });
}

export async function processQueue(bookId: string) {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || book.availableCopies <= 0) return;

  const nextReservation = await (prisma as any).bookReservation.findFirst({
    where: {
      bookId,
      status: ReservationStatus.PENDING
    },
    orderBy: [
      { priority: 'asc' },
      { createdAt: 'asc' }
    ],
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  if (nextReservation) {
    const readyExpiresAt = new Date();
    readyExpiresAt.setHours(readyExpiresAt.getHours() + 24); // 24 hours to pick up

    await (prisma as any).bookReservation.update({
      where: { id: nextReservation.id },
      data: {
        status: ReservationStatus.READY,
        expiresAt: readyExpiresAt
      }
    });

    // TODO: Send notification to user
    // await notificationsService.createReservationReadyNotification(nextReservation);

    return nextReservation;
  }

  return null;
}

export async function expireReservations() {
  const now = new Date();
  
  const expiredReservations = await (prisma as any).bookReservation.findMany({
    where: {
      status: { in: [ReservationStatus.PENDING, ReservationStatus.READY] },
      expiresAt: { lte: now }
    }
  });

  for (const reservation of expiredReservations) {
    await update(reservation.id, { status: ReservationStatus.EXPIRED });
    
    // Process queue for the book if it was a READY reservation
    if (reservation.status === ReservationStatus.READY) {
      await processQueue(reservation.bookId);
    }
  }

  return expiredReservations.length;
}

export async function getUserPosition(userId: string, bookId: string) {
  const userReservation = await (prisma as any).bookReservation.findFirst({
    where: {
      userId,
      bookId,
      status: ReservationStatus.PENDING
    }
  });

  if (!userReservation) return null;

  const position = await (prisma as any).bookReservation.count({
    where: {
      bookId,
      status: ReservationStatus.PENDING,
      priority: { lt: userReservation.priority }
    }
  });

  return position + 1; // 1-based position
}

async function reorderQueue(bookId: string, fromPriority: number) {
  await (prisma as any).$transaction(async (tx: any) => {
    const reservations = await tx.bookReservation.findMany({
      where: {
        bookId,
        status: ReservationStatus.PENDING,
        priority: { gt: fromPriority }
      },
      orderBy: { priority: 'asc' }
    });

    for (let i = 0; i < reservations.length; i++) {
      await tx.bookReservation.update({
        where: { id: reservations[i].id },
        data: { priority: fromPriority + i }
      });
    }
  });
}

export async function getQueueStats(bookId: string) {
  const [totalPending, totalReady, totalFulfilled] = await Promise.all([
    (prisma as any).bookReservation.count({
      where: { bookId, status: ReservationStatus.PENDING }
    }),
    (prisma as any).bookReservation.count({
      where: { bookId, status: ReservationStatus.READY }
    }),
    (prisma as any).bookReservation.count({
      where: { bookId, status: ReservationStatus.FULFILLED }
    }),
  ]);

  return {
    pending: totalPending,
    ready: totalReady,
    fulfilled: totalFulfilled,
    total: totalPending + totalReady + totalFulfilled
  };
}