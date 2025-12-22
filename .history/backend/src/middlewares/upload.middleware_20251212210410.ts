import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { config } from '../config';
import { generateUniqueFilename, sanitizeFilename } from '../utils';
import { AppError } from './error.middleware';

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = generateUniqueFilename(file.originalname);
    cb(null, uniqueName);
  },
});

// File filter - only allow specified types (JPG, PNG, PDF as per spec)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPG, PNG, and PDF are allowed.', 400));
  }
};

// Configure multer with 5MB limit as per spec
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize,
    files: 5, // Max 5 files per upload
  },
});

// Middleware for single file upload
export const uploadSingle = upload.single('attachment');

// Middleware for multiple file uploads
export const uploadMultiple = upload.array('attachments', 5);
