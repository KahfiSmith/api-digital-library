import { Request, Response } from 'express';
import { ResponseUtil } from '@/utils/response';
import { publicUrlFrom } from '@/utils/storage';
import { AppError } from '@/utils/appError';

export async function uploadBookCover(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  
  if (!file) {
    throw AppError.badRequest('No file uploaded');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw AppError.badRequest('Invalid file type. Only JPEG and PNG images are allowed');
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw AppError.badRequest('File too large. Maximum size is 5MB');
  }

  const relPath = file.path.replace(/^[.\\/]+/, '').replace(/\\/g, '/');
  const url = publicUrlFrom(relPath);

  return ResponseUtil.success(res, 'Book cover uploaded successfully', {
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    url,
    path: relPath
  });
}

export async function uploadBookPdf(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  
  if (!file) {
    throw AppError.badRequest('No file uploaded');
  }

  // Validate file type
  if (file.mimetype !== 'application/pdf') {
    throw AppError.badRequest('Invalid file type. Only PDF files are allowed');
  }

  // Validate file size (50MB max for PDFs)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw AppError.badRequest('File too large. Maximum size is 50MB');
  }

  const relPath = file.path.replace(/^[.\\/]+/, '').replace(/\\/g, '/');
  const url = publicUrlFrom(relPath);

  return ResponseUtil.success(res, 'Book PDF uploaded successfully', {
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    url,
    path: relPath
  });
}

export async function uploadUserAvatar(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  
  if (!file) {
    throw AppError.badRequest('No file uploaded');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw AppError.badRequest('Invalid file type. Only JPEG and PNG images are allowed');
  }

  // Validate file size (2MB max for avatars)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    throw AppError.badRequest('File too large. Maximum size is 2MB');
  }

  const relPath = file.path.replace(/^[.\\/]+/, '').replace(/\\/g, '/');
  const url = publicUrlFrom(relPath);

  return ResponseUtil.success(res, 'Avatar uploaded successfully', {
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    url,
    path: relPath
  });
}

export async function uploadGeneral(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  
  if (!file) {
    throw AppError.badRequest('No file uploaded');
  }

  // Validate file type (allow common file types)
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    throw AppError.badRequest('Invalid file type. Allowed types: images, PDF, Word, Excel, text files');
  }

  // Validate file size (10MB max for general uploads)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw AppError.badRequest('File too large. Maximum size is 10MB');
  }

  const relPath = file.path.replace(/^[.\\/]+/, '').replace(/\\/g, '/');
  const url = publicUrlFrom(relPath);

  return ResponseUtil.success(res, 'File uploaded successfully', {
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    url,
    path: relPath
  });
}

export async function uploadMultiple(req: Request, res: Response) {
  const files = (req as any).files as Express.Multer.File[] | undefined;
  
  if (!files || files.length === 0) {
    throw AppError.badRequest('No files uploaded');
  }

  // Process each file
  const uploadedFiles = files.map(file => {
    const relPath = file.path.replace(/^[.\\/]+/, '').replace(/\\/g, '/');
    const url = publicUrlFrom(relPath);

    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url,
      path: relPath
    };
  });

  return ResponseUtil.success(res, `${files.length} files uploaded successfully`, {
    files: uploadedFiles,
    count: files.length,
    totalSize: files.reduce((sum, file) => sum + file.size, 0)
  });
}