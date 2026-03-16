import { Router } from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { uploadSingle, uploadBulk } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { LoginSchema, CreateUserSchema, UpdateUserSchema } from '@edu-portal/shared';

import * as authCtrl   from '../controllers/auth.controller';
import * as uploadCtrl from '../controllers/upload.controller';
import * as schoolCtrl from '../controllers/school.controller';
import * as adminCtrl  from '../controllers/admin.controller';

const router = Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/auth/login',   validate(LoginSchema),  authCtrl.loginHandler);
router.post('/auth/refresh',                         authCtrl.refreshHandler);
router.post('/auth/logout',                          authCtrl.logoutHandler);
router.get ('/auth/me',      authenticate,           authCtrl.meHandler);

// ── Uploads ───────────────────────────────────────────────────────────────────
router.get ('/uploads/stats',          authenticate,                     uploadCtrl.getStats);
router.get ('/uploads/bulk-template',  authenticate,                     uploadCtrl.downloadTemplate);
router.get ('/uploads',                authenticate,                     uploadCtrl.listUploads);
router.get ('/uploads/:id',            authenticate,                     uploadCtrl.getUpload);
router.get ('/uploads/:id/url',        authenticate,                     uploadCtrl.getPresignedUrl);
router.post('/uploads',                authenticate, uploadSingle,       uploadCtrl.createUpload);
router.post('/uploads/bulk',           authenticate, uploadBulk,         uploadCtrl.bulkUploadHandler);
router.put   ('/uploads/:id',           authenticate,                      uploadCtrl.updateUpload);
router.delete('/uploads/:id',          authenticate, requireRole('ADMIN'),uploadCtrl.deleteUpload);

// ── Schools ───────────────────────────────────────────────────────────────────
router.get('/schools',                        authenticate, schoolCtrl.listAllSchools);
router.get('/schools/districts',              authenticate, schoolCtrl.getDistricts);
router.get('/schools/districts/:district/blocks', authenticate, schoolCtrl.getBlocks);
router.get('/schools/districts/:district/blocks/:block/schools', authenticate, schoolCtrl.getSchools);
router.post('/schools',                       authenticate, requireRole('ADMIN'), schoolCtrl.createSchool);
router.put ('/schools/:id',                   authenticate, requireRole('ADMIN'), schoolCtrl.updateSchool);
router.delete('/schools/:id',                 authenticate, requireRole('ADMIN'), schoolCtrl.deleteSchool);
router.post('/schools/ingest',                authenticate, requireRole('ADMIN'),
  multer({ storage: multer.memoryStorage() }).single('file'),
  schoolCtrl.ingestExcel
);

// ── Admin / Users ─────────────────────────────────────────────────────────────
router.get   ('/admin/users',          authenticate, requireRole('ADMIN'), adminCtrl.listUsers);
router.post  ('/admin/users',          authenticate, requireRole('ADMIN'), validate(CreateUserSchema), adminCtrl.createUser);
router.put   ('/admin/users/:id',      authenticate, requireRole('ADMIN'), validate(UpdateUserSchema), adminCtrl.updateUser);
router.delete('/admin/users/:id',      authenticate, requireRole('ADMIN'), adminCtrl.deleteUser);
router.post  ('/admin/change-password',authenticate,                       adminCtrl.changePassword);

export default router;
