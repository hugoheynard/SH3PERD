import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';
import { AudioProcessorController } from './audio-processor.controller';
import { S3Service } from './s3/s3.service';

/* ── Environment validation ────────────────────────────────────────── */

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'prod']).default('dev'),
  PORT: z.string().default('3001'),
  S3_BUCKET_NAME: z.string().min(1, 'S3_BUCKET_NAME is required'),
  S3_REGION: z.string().default('auto'),
  S3_ENDPOINT: z.string().min(1, 'S3_ENDPOINT is required'),
  S3_ACCESS_KEY_ID: z.string().min(1, 'S3_ACCESS_KEY_ID is required'),
  S3_SECRET_ACCESS_KEY: z.string().min(1, 'S3_SECRET_ACCESS_KEY is required'),
  // AI mastering (optional — only required if AI_MASTER_TRACK is used)
  DEEPAFX_CHECKPOINT_PATH: z.string().optional(),
  DEEPAFX_PYTHON: z.string().default('python3'),
  DEEPAFX_WORKER_PATH: z.string().optional(),
});

function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Environment validation failed');
  }
  return result.data;
}

/* ── Module ────────────────────────────────────────────────────────── */

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })],
  controllers: [AudioProcessorController],
  providers: [S3Service],
})
export class AppModule {}
