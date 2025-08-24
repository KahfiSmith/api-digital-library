import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '@/types';

export class ResponseUtil {
  static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    } as ApiResponse<T>);
  }

  static error(res: Response, message: string, statusCode: number = 500, error?: string): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      error
    } as ApiResponse);
  }

  static paginated<T>(
    res: Response,
    message: string,
    data: T[],
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    },
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination
    } as PaginatedResponse<T>);
  }
}