import type { TCreateUserInput } from '../types/user.core.contracts.js';
import type { TUserDomainModel } from '../types/user.domain.types.js';

/**
 * Creates a user credentials object from the input data.
 * @param input
 */
export const createUserCredentials = (input: TCreateUserInput): TUserDomainModel => {
  const { email, password, user_id } = input;
  return {
    user_id,
    email,
    password,
    active: true,
    email_verified: false,
    created_at: new Date(),
    updated_at: new Date(),
  };
};
