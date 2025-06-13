
console.log('[ENV] loadEnv file loaded');

/**
 * Loads environment variables from `.env.app` + `.env.{env}`
 *
 * @param envName - 'dev' | 'prod' | 'test'
 */
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import process from 'process';

console.log('[ENV] loadEnv file loaded');

/**
 * Loads environment variables from `.env.app` + `.env.{env}`
 * @param envName - Environment name (e.g. 'dev', 'prod')
 */
export const loadEnv = (envName: string = process.env.NODE_ENV || 'dev'): void => {
    const baseEnvPath = path.resolve(process.cwd(), '.env.app');
    const envSpecificPath = path.resolve(process.cwd(), `.env.${envName}`);

    [baseEnvPath, envSpecificPath].forEach((envPath) => {
        if (fs.existsSync(envPath)) {
            // Load the environment file and override existing variables
            dotenv.config({ path: envPath, override: true });
            console.log(`[ENV] Loaded: ${envPath}`);
        } else {
            throw new Error(`[ENV] Missing environment file: ${envPath}`);
        }
    });

    // ✅ Validate required variables
    const requiredVars = ['PORT', 'ATLAS_URI', 'CORE_DB_NAME'];
    const missing = requiredVars.filter((key) => !process.env[key]);
    if (missing.length) {
        throw new Error(`[ENV] Missing required environment variables: ${missing.join(', ')}`);
    }

    console.log(`[ENV] Environment loaded for '${envName}'`);
};
