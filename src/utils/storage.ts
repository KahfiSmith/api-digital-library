import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const BASE_UPLOAD_PATH = process.env.UPLOAD_PATH || path.join('public', 'uploads');
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024); // 10MB default
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,doc,docx')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function makeStorage(subdir: string) {
  const dest = path.join(BASE_UPLOAD_PATH, subdir);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = uuidv4() + ext;
      cb(null, name);
    },
  });
}

function filterByExtensions(allowed: string[]) {
  return function (_req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (!allowed.includes(ext)) {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, true);
  };
}

export const uploadAvatar = multer({
  storage: makeStorage(path.join('avatars')),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: filterByExtensions(['jpg', 'jpeg', 'png']),
});

export const uploadCover = multer({
  storage: makeStorage(path.join('covers')),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: filterByExtensions(['jpg', 'jpeg', 'png']),
});

export const uploadPdf = multer({
  storage: makeStorage(path.join('pdfs')),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: filterByExtensions(['pdf']),
});

export function publicUrlFrom(relPath: string): string {
  // Ensure prefix with /public for serving
  const normalized = relPath.replace(/\\/g, '/');
  if (normalized.startsWith('public/')) return '/' + normalized;
  return '/public/' + normalized;
}

