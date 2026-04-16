import { isRehashDueFromLastHashDate } from '../utils/isRehashDueFromLastHashDate.js';
import { HashParser } from '../utils/HashParser.js';
import { createHasherRegistry } from '../hasherRegistry/createHasherRegistry.js';
import { PasswordService } from '../PasswordService.js';
import bcrypt from 'bcrypt';

const passwordManager = new PasswordService({
  currentStrategyKey: 'argon2id:v1',
  registry: createHasherRegistry({ hashParser: HashParser }),
  hashParserFunction: HashParser.extract,
  verifyLastHashDateFunction: isRehashDueFromLastHashDate,
  rehashAfterDays: 30,
});

describe('PasswordManager - real instance', () => {
  it('should validate correct password', async () => {
    const password = 'correctHorseBatteryStaple';
    const hash = await passwordManager.hashPassword({ password });

    const result = await passwordManager.comparePassword({
      password,
      hashedPassword: hash,
    });

    expect(result.isValid).toBe(true);
    expect(result.wasRehashed).toBe(false);
  });

  it('should reject wrong password', async () => {
    const hash = await passwordManager.hashPassword({ password: 'secret123' });

    const result = await passwordManager.comparePassword({
      password: 'wrongpassword',
      hashedPassword: hash,
    });

    expect(result.isValid).toBe(false);
    expect(result.wasRehashed).toBe(false);
  });

  it('should validate and rehash if password was hashed with bcrypt', async () => {
    const password = 'SafePass123!';

    // Instance en bcrypt
    const bcryptManager = new PasswordService({
      currentStrategyKey: 'bcrypt:v1',
      registry: createHasherRegistry({ hashParser: HashParser }),
      hashParserFunction: HashParser.extract,
      verifyLastHashDateFunction: isRehashDueFromLastHashDate,
      rehashAfterDays: 30,
    });

    // Hash with old strategy
    const bcryptHash = await bcryptManager.hashPassword({ password });
    // Instance argon

    const argon2Manager = new PasswordService({
      currentStrategyKey: 'argon2id:v1',
      registry: createHasherRegistry({ hashParser: HashParser }),
      hashParserFunction: HashParser.extract,
      verifyLastHashDateFunction: isRehashDueFromLastHashDate,
      rehashAfterDays: 30,
    });

    const result = await argon2Manager.comparePassword({
      password,
      hashedPassword: bcryptHash,
    });

    expect(result.isValid).toBe(true);
    expect(result.wasRehashed).toBe(true);
    expect(result.newHash).toBeDefined();
  });

  it('should trigger rehash if hash is older than rehashAfterDays', async () => {
    const password = 'SafePass123!';
    const daysAgo = 90;

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - daysAgo);
    const hashed_at = pastDate.toISOString();

    // 🔐 Hash réel
    const rawHash = await bcrypt.hash(password, 12);

    // 🧱 Construit un hash enrichi avec vieille date
    const oldHashWithMeta = ['bcrypt', 'bcrypt', 'v1', hashed_at, rawHash].join(':::');

    // 🔐 Vérifie avec un manager qui va rehasher si date trop ancienne
    const manager = new PasswordService({
      currentStrategyKey: 'bcrypt:v1',
      registry: createHasherRegistry({ hashParser: HashParser }),
      hashParserFunction: HashParser.extract,
      verifyLastHashDateFunction: isRehashDueFromLastHashDate,
      rehashAfterDays: 30, // ← forcera un rehash
    });

    const result = await manager.comparePassword({
      password,
      hashedPassword: oldHashWithMeta,
    });

    expect(result.isValid).toBe(true);
    expect(result.wasRehashed).toBe(true);
    expect(result.newHash).toBeDefined();
  });
});
