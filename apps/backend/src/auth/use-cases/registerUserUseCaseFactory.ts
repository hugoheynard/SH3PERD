import { BusinessError } from '../../utils/errorManagement/errorClasses/BusinessError.js';
import { UserCredential } from '../../user/domain/entities/UserCredential.js';
import type { THashPasswordFn } from '../types/auth.core.contracts.js';
import type { TUserCredentialsRecord, TRegisterUserResponseDTO, TUserCredentialsDTO } from '@sh3pherd/shared-types';
import type {
  TGenericRepoFindOneFn,
  TGenericSaveFn,
} from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';


//--- Register Use Case Types ---//
export type TRegisterUserUseCaseDeps = {
  findOneFn: TGenericRepoFindOneFn<TUserCredentialsRecord>;
  hashPasswordFn: THashPasswordFn;
  saveFn: TGenericSaveFn<TUserCredentialsRecord>;
};
export type TRegisterUserUseCase = (input: TUserCredentialsDTO) => Promise<TRegisterUserResponseDTO>;

/**
 * createRegisterUserUseCase - Handles user registration logic.
 *
 * This use case is responsible for orchestrating the full registration process:
 * - Verifies email uniqueness
 * - Generates a user ID
 * - Hashes the password
 * - Constructs a domain user object
 * - Persists the user in the database
 *
 * @param deps - All injected dependencies required to perform the registration:
 *   - `findUserByEmailFn`: checks if the email is already in use
 *   - `hashPasswordFn`: hashes the provided password securely
 *   - `createUserFn`: builds the user domain model
 *   - `saveUserFn`: persists the user into the database
 *   - `generateUserIdFn`: generates a unique typed user ID
 *
 * @returns An async function that takes user credentials and returns the new user ID
 *
 * @throws `BusinessError` if the email is already used
 *
 * @example
 * const useCase = createRegisterUserUseCase(deps);
 * const { user_id } = await useCase({ email: 'a@test.com', password: 'secure' });
 */
export function registerUserUseCaseFactory(deps: TRegisterUserUseCaseDeps): TRegisterUserUseCase {
  const { findOneFn, hashPasswordFn, saveFn} = deps;

  return async function registerUserUseCase (request) {


    const existing = await findOneFn({ filter: { email: request.email } });

    if (existing) {
      throw new BusinessError('email already in use', 'USER_ALREADY_EXISTS', 409);
    }

    const user = new UserCredential({
      email: request.email,
      password: await hashPasswordFn({ password: request.password }),
      email_verified: false,
      active: true
    });

    await saveFn({
      ...user.toDomain,
      ...RecordMetadataUtils.create(user.id)
    });

    return user.toDomain;
  };
}

