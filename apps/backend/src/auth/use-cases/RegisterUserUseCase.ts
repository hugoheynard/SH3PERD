import { Inject, Injectable } from '@nestjs/common';
import type { IPasswordService } from '../core/password-manager/types/Interfaces.js';
import { BusinessError } from '../../utils/errorManagement/errorClasses/BusinessError.js';
import { UserCredential } from '../../user/credentials/UserCredential.entity.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import type { IUserCredentialsRepository } from '../../user/credentials/UserCredentialsMongoRepo.repository.js';
import type { TRegisterUserResponseDTO, TRegisterUserRequestDTO } from '@sh3pherd/shared-types';
import { PASSWORD_SERVICE } from '../auth.tokens.js';
import { USER_CREDENTIALS_REPO, USER_PROFILE_REPO } from '../../appBootstrap/nestTokens.js';
import { UserProfile } from '../../user/profile/user-profile.entity.js';
import type { IUserProfileRepository } from '../../user/profile/UserProfileMongoRepo.repository.js';

export type TRegisterUserUseCase = (input: TRegisterUserRequestDTO) => Promise<TRegisterUserResponseDTO>;


@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(PASSWORD_SERVICE) private readonly password: IPasswordService,
    @Inject(USER_CREDENTIALS_REPO) private readonly userCredsRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly userProfileRepo: IUserProfileRepository,
    ) {}

  /**
   * This use case is responsible for orchestrating the full registration process:
   * - Verifies email uniqueness
   * - Generates a user ID
   * - Hashes the password
   * - Constructs a domain userCredential Entity
   * - Persists the user in the database
   */
  async execute(requestDTO: TRegisterUserRequestDTO): Promise<TRegisterUserResponseDTO> {
    const existing = await this.userCredsRepo.findOne({ filter: { email: requestDTO.email } });

    if (existing) {
      throw new BusinessError('email already in use', 'USER_ALREADY_EXISTS', 409);
    }

    const credentials = new UserCredential({
      email: requestDTO.email,
      password: await this.password.hashPassword({ password: requestDTO.password }),
      email_verified: false,
      active: true
    });

    const profile = new UserProfile({
      user_id: credentials.id,
      first_name: requestDTO.first_name,
      last_name: requestDTO.last_name
    })

    const session = await this.userCredsRepo.startSession()

    try {
      await session.withTransaction(async () => {
        await this.userCredsRepo.save(
          { ...credentials.toDomain, ...RecordMetadataUtils.create(credentials.id) },
          session,
        );

        await this.userProfileRepo.save(
          { ...profile.toDomain, ...RecordMetadataUtils.create(credentials.id) },
          session,
        );
      });

      return credentials.toDomain;
    } finally {
      await session.endSession();
    }
  }
}
