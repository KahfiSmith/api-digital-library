import { Request, Response } from 'express';
import * as reservationsService from '@/services/reservations.service';
import { ResponseUtil } from '@/utils/response';
import { AppError } from '@/utils/appError';

export async function createReservation(req: Request, res: Response) {
  const userId = req.user!.id;
  const { bookId, notes } = req.body;

  const reservation = await reservationsService.create({
    userId,
    bookId,
    notes,
  });

  return ResponseUtil.success(res, 'Reservation created successfully', reservation);
}

export async function getMyReservations(req: Request, res: Response) {
  const userId = req.user!.id;
  const { status, page, limit } = req.query;

  const { items, total } = await reservationsService.findMany({
    userId,
    status: status as any,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  const pageNum = Number(page || 1);
  const limitNum = Number(limit || 10);
  const totalPages = Math.ceil(total / limitNum);

  return ResponseUtil.paginated(res, 'User reservations retrieved successfully', items, {
    currentPage: pageNum,
    totalPages,
    totalItems: total,
    itemsPerPage: limitNum,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1,
  });
}

export async function getReservation(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw AppError.badRequest('Reservation ID is required');
  
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const reservation = await reservationsService.findById(id);

  // Users can only see their own reservations, admins can see all
  if (userRole !== 'ADMIN' && userRole !== 'LIBRARIAN' && reservation.userId !== userId) {
    throw AppError.forbidden('Access denied');
  }

  return ResponseUtil.success(res, 'Reservation retrieved successfully', reservation);
}

export async function updateReservation(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw AppError.badRequest('Reservation ID is required');
  
  const { status, notes } = req.body;
  const userRole = req.user!.role;

  // Only admins and librarians can update reservation status
  if ((status && userRole !== 'ADMIN' && userRole !== 'LIBRARIAN')) {
    throw AppError.forbidden('Only administrators can update reservation status');
  }

  const reservation = await reservationsService.update(id, { status, notes });

  return ResponseUtil.success(res, 'Reservation updated successfully', reservation);
}

export async function cancelReservation(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) throw AppError.badRequest('Reservation ID is required');
  
  const userId = req.user!.id;

  const reservation = await reservationsService.cancel(id, userId);

  return ResponseUtil.success(res, 'Reservation cancelled successfully', reservation);
}

export async function getQueuePosition(req: Request, res: Response) {
  const userId = req.user!.id;
  const { bookId } = req.params;
  if (!bookId) throw AppError.badRequest('Book ID is required');

  const position = await reservationsService.getUserPosition(userId, bookId);

  if (!position) {
    return ResponseUtil.success(res, 'No active reservation found', { position: null });
  }

  return ResponseUtil.success(res, 'Queue position retrieved successfully', { 
    position,
    message: `You are #${position} in the queue for this book`
  });
}

export async function getBookQueue(req: Request, res: Response) {
  const { bookId } = req.params;
  if (!bookId) throw AppError.badRequest('Book ID is required');
  
  const { status, page, limit } = req.query;

  const { items, total } = await reservationsService.findMany({
    bookId,
    status: status as any,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  const stats = await reservationsService.getQueueStats(bookId);

  const pageNum = Number(page || 1);
  const limitNum = Number(limit || 10);
  const totalPages = Math.ceil(total / limitNum);

  return ResponseUtil.success(res, 'Book reservations retrieved successfully', {
    items,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems: total,
      itemsPerPage: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
    queueStats: stats
  });
}

export async function getAllReservations(req: Request, res: Response) {
  const { userId, bookId, status, page, limit } = req.query;

  const { items, total } = await reservationsService.findMany({
    userId: userId as string,
    bookId: bookId as string,
    status: status as any,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  const pageNum = Number(page || 1);
  const limitNum = Number(limit || 10);
  const totalPages = Math.ceil(total / limitNum);

  return ResponseUtil.paginated(res, 'All reservations retrieved successfully', items, {
    currentPage: pageNum,
    totalPages,
    totalItems: total,
    itemsPerPage: limitNum,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1,
  });
}

export async function processBookQueue(req: Request, res: Response) {
  const { bookId } = req.params;
  if (!bookId) throw AppError.badRequest('Book ID is required');

  const nextReservation = await reservationsService.processQueue(bookId);

  if (nextReservation) {
    return ResponseUtil.success(res, 'Queue processed successfully', {
      message: `Book is now ready for ${nextReservation.user.firstName} ${nextReservation.user.lastName}`,
      reservation: nextReservation
    });
  }

  return ResponseUtil.success(res, 'No pending reservations to process', null);
}