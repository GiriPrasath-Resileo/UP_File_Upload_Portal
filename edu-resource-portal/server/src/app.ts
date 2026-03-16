import './config/env'; // validate env first
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { logger } from './utils/logger';
import router from './routes/index';
import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();

// Security
app.use(helmet({
  contentSecurityPolicy: false, // Allow Swagger UI assets
}));
app.use(cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression() as express.RequestHandler);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', env: env.NODE_ENV }));

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'EduResource Portal API',
    version: '1.0.0',
    description: 'REST API for EduResource Portal — Uttar Pradesh state educational resource management system. Manages file uploads (PDFs), school master data, user administration, and sequential file numbering.',
    contact: { name: 'EduResource Team' },
  },
  servers: [{ url: `http://localhost:${env.PORT}/api`, description: 'Development' }],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'accessToken' },
    },
  },
  security: [{ cookieAuth: [] }],
  tags: [
    { name: 'Auth',    description: 'Authentication and session management' },
    { name: 'Uploads', description: 'File upload management' },
    { name: 'Schools', description: 'School master data' },
    { name: 'Admin',   description: 'User administration (Admin only)' },
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { userId: { type: 'string' }, password: { type: 'string' } },
                required: ['userId', 'password'],
              },
            },
          },
        },
        responses: { 200: { description: 'Login successful' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        responses: { 204: { description: 'Logged out' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        responses: { 200: { description: 'Current user info' } },
      },
    },
    '/uploads/stats': {
      get: {
        tags: ['Uploads'],
        summary: 'Upload statistics',
        responses: { 200: { description: 'Stats object' } },
      },
    },
    '/uploads': {
      get: {
        tags: ['Uploads'],
        summary: 'List uploads (paginated)',
        parameters: [
          { name: 'page',     in: 'query', schema: { type: 'integer' } },
          { name: 'limit',    in: 'query', schema: { type: 'integer' } },
          { name: 'search',   in: 'query', schema: { type: 'string' } },
          { name: 'district', in: 'query', schema: { type: 'string' } },
          { name: 'status',   in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Paginated uploads list' } },
      },
      post: {
        tags: ['Uploads'],
        summary: 'Create upload (multipart/form-data PDF)',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file:         { type: 'string', format: 'binary' },
                  district:     { type: 'string' },
                  block:        { type: 'string' },
                  schoolName:   { type: 'string' },
                  udiseCode:    { type: 'string' },
                  medium:       { type: 'string' },
                  classGrade:   { type: 'string' },
                  subject:      { type: 'string' },
                  sampleType:   { type: 'string' },
                  gender:       { type: 'string' },
                  dominantHand: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Upload created' } },
      },
    },
    '/uploads/{id}': {
      put: {
        tags: ['Uploads'],
        summary: 'Update editable fields',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated upload' } },
      },
      delete: {
        tags: ['Uploads'],
        summary: 'Delete upload (Admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Deleted' } },
      },
    },
    '/uploads/{id}/url': {
      get: {
        tags: ['Uploads'],
        summary: 'Get S3 presigned URL',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Presigned URL object' } },
      },
    },
    '/schools': {
      get: {
        tags: ['Schools'],
        summary: 'List all schools',
        responses: { 200: { description: 'Schools list' } },
      },
    },
    '/schools/districts': {
      get: {
        tags: ['Schools'],
        summary: 'Get distinct districts',
        responses: { 200: { description: 'Districts array' } },
      },
    },
    '/schools/districts/{district}/blocks': {
      get: {
        tags: ['Schools'],
        summary: 'Get blocks for a district',
        parameters: [{ name: 'district', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Blocks array' } },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all users',
        responses: { 200: { description: 'Users list' } },
      },
      post: {
        tags: ['Admin'],
        summary: 'Create a new user',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId:        { type: 'string' },
                  password:      { type: 'string' },
                  role:          { type: 'string', enum: ['ADMIN', 'UPLOADER'] },
                  districtScope: { type: 'string' },
                },
                required: ['userId', 'password', 'role'],
              },
            },
          },
        },
        responses: { 201: { description: 'User created' } },
      },
    },
    '/admin/users/{id}': {
      put: {
        tags: ['Admin'],
        summary: 'Update user role/scope/status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated user' } },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Delete user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Deleted' } },
      },
    },
  },
};

const dashboardUrl = new URL('/dashboard', env.CLIENT_ORIGIN).href;

app.get('/api-docs', (_req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>API Docs — EduResource Portal</title>
</head>
<body style="margin:0;font-family:system-ui,sans-serif;">
  <div style="padding:12px 20px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:12px;">
    <a href="${dashboardUrl}" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:#334155;font-weight:500;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Back to App
    </a>
  </div>
  <iframe src="/api-docs/ui/" style="width:100%;height:calc(100vh - 49px);border:0"></iframe>
</body>
</html>
  `);
});
app.use('/api-docs/ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'EduResource API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// API routes
app.use('/api', router);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});

export default app;
