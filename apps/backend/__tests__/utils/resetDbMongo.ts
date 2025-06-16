import type { Db } from 'mongodb';
/**
 * Resets the test database by deleting all documents in all collections,
 * except those specified in the ignoreCollections option.
 *
 * @param db - The MongoDB database instance to reset.
 * @param options - Optional configuration for the reset operation.
 * @param options.ignoreCollections - An array of collection names to ignore during the reset.
 *
 * @throws Will throw an error if called outside of a test environment.
 */
export const resetDbMongo = async (db: Db, options?: { ignoreCollections?: string[] }): Promise<void> => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('[resetTestDb] Unsafe operation outside of test environment');
  }

  const ignore = options?.ignoreCollections ?? [];

  const collections = await db.listCollections().toArray();

  await Promise.all(
    collections
      .filter(col => !ignore.includes(col.name))
      .map(col => db.collection(col.name).deleteMany({}))
  );
};
