import { Router } from 'express';
import * as UploadController from '@/controllers/upload.controller';
import { authenticateJWT, requireRoles } from '@/middleware/auth';
import { uploadCover, uploadPdf, uploadAvatar } from '@/utils/storage';
import multer from 'multer';
import path from 'path';

const router: Router = Router();

// General upload storage for multiple file types
const generalUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.env.UPLOAD_PATH || 'public/uploads', 'general');
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
      cb(null, name);
    }
  }),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // Max 10 files at once
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Book cover upload (Admin/Librarian only)
router.post('/book-cover', 
  authenticateJWT,
  requireRoles('ADMIN', 'LIBRARIAN'),
  uploadCover.single('file'),
  UploadController.uploadBookCover
);

// Book PDF upload (Admin/Librarian only)
router.post('/book-pdf',
  authenticateJWT,
  requireRoles('ADMIN', 'LIBRARIAN'),
  uploadPdf.single('file'),
  UploadController.uploadBookPdf
);

// User avatar upload (Authenticated users)
router.post('/avatar',
  authenticateJWT,
  uploadAvatar.single('file'),
  UploadController.uploadUserAvatar
);

// General file upload (Admin/Librarian only)
router.post('/general',
  authenticateJWT,
  requireRoles('ADMIN', 'LIBRARIAN'),
  generalUpload.single('file'),
  UploadController.uploadGeneral
);

// Multiple file upload (Admin/Librarian only)
router.post('/multiple',
  authenticateJWT,
  requireRoles('ADMIN', 'LIBRARIAN'),
  generalUpload.array('files', 10),
  UploadController.uploadMultiple
);

export default router;