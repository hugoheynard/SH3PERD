import { Inject, Injectable } from '@nestjs/common';
import type { ClientSession, MongoClient } from 'mongodb';
import { MONGO_CLIENT } from './db.tokens.js';
import { BusinessError } from '../../utils/errorManagement/BusinessError.js';
import { DomainError } from '../../utils/errorManagement/DomainError.js';
import { TechnicalError } from '../../utils/errorManagement/TechnicalError.js';

/**
 * Encapsulates MongoDB transaction lifecycle.
 *
 * Provides a `run()` method that starts a session, executes a callback
 * within a transaction, and handles commit/abort/cleanup.
 *
 * The callback receives a `ClientSession` that repos can use to participate
 * in the transaction (pass it as the `session` option on repo methods).
 *
 * @example
 * ```ts
 * await this.transaction.run(async (session) => {
 *   await this.companyRepo.save(companyRecord, session);
 *   await this.contractRepo.save(contractRecord, session);
 * });
 * // Both inserts succeed or both are rolled back.
 * ```
 *
 * @note MongoDB transactions require a **replica set**.
 * Atlas (including free tier) is a replica set by default.
 * Local standalone mongod does not support transactions.
 */
@Injectable()
export class TransactionRunner {
  constructor(@Inject(MONGO_CLIENT) private readonly client: MongoClient) {}

  /**
   * Runs the callback inside a MongoDB transaction.
   * If the callback throws, the transaction is aborted and the error re-thrown.
   */
  async run<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = this.client.startSession();
    try {
      let result: T;
      await session.withTransaction(async () => {
        result = await fn(session);
      });
      return result!;
    } catch (err) {
      // Preserve typed errors — caller-facing domain decisions (4xx / 400) and
      // already-categorized infra failures must reach the handler unchanged,
      // so the handler can enrich with its own context or rethrow as-is.
      if (
        err instanceof TechnicalError ||
        err instanceof BusinessError ||
        err instanceof DomainError
      ) {
        throw err;
      }
      throw new TechnicalError('Transaction failed', {
        code: 'TRANSACTION_FAILED',
        cause: err as Error,
      });
    } finally {
      await session.endSession();
    }
  }
}
