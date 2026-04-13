import type {
  TUserId,
  TUserCredentialsRecord,
  TUserProfileRecord,
  TUserPreferencesRecord,
  TContractId,
} from '@sh3pherd/shared-types';
import type { IUserCredentialsRepository } from '../infra/UserCredentialsMongoRepo.repository';
import type { IUserProfileRepository } from '../infra/UserProfileMongoRepo.repository';
import type { IUserPreferencesRepository } from '../infra/UserPreferencesMongoRepo.repository';
import type { IPasswordService } from '../../auth/core/password-manager/types/Interfaces';

// ─── ID Helpers ───────────────────────────────────────────────
export const userId = (n = 1) => `user_test-${n}` as TUserId;

// ─── Record Factories ────────────────────────────────────────
export function makeCredentialsRecord(
  overrides: Partial<TUserCredentialsRecord> = {},
): TUserCredentialsRecord {
  return {
    id: userId(),
    email: 'test@example.com',
    password: 'hashed-password',
    active: true,
    email_verified: true,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: userId(),
    creation_context: 'test',
    ...overrides,
  } as TUserCredentialsRecord;
}

export function makeProfileRecord(overrides: Partial<TUserProfileRecord> = {}): TUserProfileRecord {
  return {
    id: 'userProfile_test-1' as any,
    user_id: userId(),
    first_name: 'John',
    last_name: 'Doe',
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: userId(),
    creation_context: 'test',
    ...overrides,
  } as TUserProfileRecord;
}

export function makePreferencesRecord(
  overrides: Partial<TUserPreferencesRecord> = {},
): TUserPreferencesRecord {
  return {
    id: 'userPreferences_test-1' as any,
    user_id: userId(),
    theme: 'light' as const,
    contract_workspace: 'contract_test-1' as TContractId,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: userId(),
    creation_context: 'test',
    ...overrides,
  } as TUserPreferencesRecord;
}

// ─── Mock Repositories ───────────────────────────────────────
export function mockCredsRepo(): jest.Mocked<IUserCredentialsRepository> {
  return {
    save: jest.fn().mockResolvedValue(true),
    findOne: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    updateOne: jest.fn().mockResolvedValue(null),
    deleteOne: jest.fn().mockResolvedValue(true),
    deleteMany: jest.fn().mockResolvedValue(true),
    startSession: jest.fn(),
    saveUser: jest.fn().mockResolvedValue(true),
    findUserByEmail: jest.fn().mockResolvedValue(null),
  } as any;
}

export function mockProfileRepo(): jest.Mocked<IUserProfileRepository> {
  return {
    save: jest.fn().mockResolvedValue(true),
    findOne: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    updateOne: jest.fn().mockResolvedValue(null),
    deleteOne: jest.fn().mockResolvedValue(true),
    deleteMany: jest.fn().mockResolvedValue(true),
    startSession: jest.fn(),
  } as any;
}

export function mockPrefsRepo(): jest.Mocked<IUserPreferencesRepository> {
  return {
    save: jest.fn().mockResolvedValue(true),
    findOne: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    updateOne: jest.fn().mockResolvedValue(null),
    deleteOne: jest.fn().mockResolvedValue(true),
    deleteMany: jest.fn().mockResolvedValue(true),
    startSession: jest.fn(),
  } as any;
}

// ─── Mock Services ───────────────────────────────────────────
export function mockPasswordService(): jest.Mocked<IPasswordService> {
  return {
    hashPassword: jest.fn().mockResolvedValue('hashed-temp-password'),
    comparePassword: jest.fn().mockResolvedValue({ isValid: true, wasRehashed: false }),
  };
}
