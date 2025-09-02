import type { TUserCredentialsRecord } from '@sh3pherd/shared-types';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import type { TCreateUserCredentialsInput } from '../types/user.credentials.contracts.js';

/**
 * Creates a user credentials object from the input data.
 * @param input
 */
export const createUserCredentials = (input: TCreateUserCredentialsInput): TUserCredentialsRecord => {
  const { user_id } = input;
  return {
    ...input,
    email_verified: false,
    ...RecordMetadataUtils.create(user_id)
  };
};
