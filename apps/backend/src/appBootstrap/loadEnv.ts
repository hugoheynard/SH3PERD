import dotenv from 'dotenv';
import path from 'node:path';
import * as process from "process";

/**
 * Loads environment variables from `.env.app` + `.env.{env}`
 *
 * @param envName - 'dev' | 'prod' | 'test'
 */
export const loadEnv = (envName: string = 'dev'): void => {
    const baseEnvPath = path.resolve(process.cwd(), '.env.app');
    const envSpecificPath = path.resolve(process.cwd(), `.env.${envName}`);

    dotenv.config({ path: baseEnvPath });
    console.log(`[ENV] Loaded base: ${baseEnvPath}`);

    dotenv.config({ path: envSpecificPath });
    console.log(`[ENV] Loaded env-specific: ${envSpecificPath}`);
};