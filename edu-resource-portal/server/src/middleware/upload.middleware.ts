import multer from 'multer';
import { env } from '../config/env';

const MAX_BYTES = env.MAX_FILE_SIZE_MB * 1024 * 1024;

export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
}).single('file');

export const uploadBulk = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES * 10 }, // higher limit for bulk
}).fields([
  { name: 'excelFile', maxCount: 1 },
  { name: 'pdfFiles', maxCount: 200 },
]);
