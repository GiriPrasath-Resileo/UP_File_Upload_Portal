import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV:               z.enum(['development', 'production', 'test']).default('development'),
  PORT:                   z.string().default('5000').transform(Number),
  APP_STATE:              z.string().min(1),
  APP_STATE_LABEL:        z.string().min(1),
  FILE_NUMBER_PREFIX:     z.string().min(1),
  FILE_NUMBER_START:      z.string().default('100000').transform(Number),
  DATABASE_URL:           z.string().min(1),
  JWT_SECRET:             z.string().min(32),
  JWT_REFRESH_SECRET:     z.string().min(32),
  JWT_ACCESS_EXPIRES_IN:  z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  AWS_REGION:             z.string().min(1),
  AWS_ACCESS_KEY_ID:      z.string().min(1),
  AWS_SECRET_ACCESS_KEY:  z.string().min(1),
  S3_BUCKET_NAME:         z.string().min(1),
  S3_MOCK:                z.string().optional().transform(v => v === 'true'),
  MAX_FILE_SIZE_MB:       z.string().default('100').transform(Number),
  ALLOWED_MIME_TYPE:      z.string().default('application/pdf'),
  S3_PRESIGNED_URL_EXPIRY: z.string().default('900').transform(Number),
  CLIENT_ORIGIN:          z.string().url(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
