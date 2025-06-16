import { bootstrapTestApp } from './bootstrapTestApp.js';
import { MONGO_CLIENT } from '../../src/appBootstrap/nestTokens.js';

export const getTestDb = async () => {
  const app = await bootstrapTestApp();
  return app.get(MONGO_CLIENT).db('sh3pherd_core_test'); // Use a specific test database
}