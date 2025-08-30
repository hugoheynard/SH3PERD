import { readFileSync } from 'fs';
import { join } from 'path';
import type { TAuthConfig } from '../../auth/types/auth.domain.config.js';
import { existsSync } from 'node:fs';

export const loadKeysFromFiles = (): { privateKey: string; publicKey: string } => {
  const privateKeyPath = join(process.cwd(), 'keys', 'private.pem');
  const publicKeyPath = join(process.cwd(), 'keys', 'public.pem');

  if (!existsSync(privateKeyPath)) {
    throw new Error(`[authConfig] Missing private key file at ${privateKeyPath}`);
  }

  if (!existsSync(publicKeyPath)) {
    throw new Error(`[authConfig] Missing public key file at ${publicKeyPath}`);
  }

  return {
    privateKey: readFileSync(privateKeyPath, 'utf-8'),
    publicKey: readFileSync(publicKeyPath, 'utf-8'),
  };
};

export const getAuthConfig = (): TAuthConfig => {
  const isProd = process.env['NODE_ENV'] === 'production';

  if (isProd && (!process.env['JWT_PRIVATE_KEY'] || !process.env['JWT_PUBLIC_KEY'])) {
    throw new Error('[authConfig] JWT keys are missing in environment variables for production');
  }

  return {
    privateKey: isProd ? (process.env['JWT_PRIVATE_KEY'] as string) : loadKeysFromFiles().privateKey,
    publicKey: isProd ? (process.env['JWT_PUBLIC_KEY'] as string) : loadKeysFromFiles().publicKey,
    authToken_TTL_SECONDS: 60 * 15,
    refreshTokenTTL_MS: 604800000,
  };
};
