import { Inject, Injectable } from '@nestjs/common';
import type { IPasswordService } from '../core/password-manager/types/Interfaces.js';
import { BusinessError } from '../../utils/errorManagement/errorClasses/BusinessError.js';
import { UserCredential } from '../../user/domain/entities/UserCredential.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import type { IUserCredentialsRepository } from '../../user/repository/UserCredentialsMongoRepository.js';
import type { TRegisterUserResponseDTO, TUserCredentialsDTO } from '@sh3pherd/shared-types';
import { PASSWORD_SERVICE } from '../auth.tokens.js';
import { USER_CREDENTIALS_REPO } from '../../appBootstrap/nestTokens.js';

export type TRegisterUserUseCase = (input: TUserCredentialsDTO) => Promise<TRegisterUserResponseDTO>;


@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(PASSWORD_SERVICE) private readonly password: IPasswordService,
    @Inject(USER_CREDENTIALS_REPO) private readonly userCredsRepo: IUserCredentialsRepository
    ) {}

  /**
   * This use case is responsible for orchestrating the full registration process:
   * - Verifies email uniqueness
   * - Generates a user ID
   * - Hashes the password
   * - Constructs a domain userCredential Entity
   * - Persists the user in the database
   */
  async execute(request: TUserCredentialsDTO): Promise<TRegisterUserResponseDTO> {
    const existing = await this.userCredsRepo.findOne({ filter: { email: request.email } });

    if (existing) {
      throw new BusinessError('email already in use', 'USER_ALREADY_EXISTS', 409);
    }

    const user = new UserCredential({
      email: request.email,
      password: await this.password.hashPassword({ password: request.password }),
      email_verified: false,
      active: true
    });

    await this.userCredsRepo.save({
      ...user.toDomain,
      ...RecordMetadataUtils.create(user.id)
    });

    return user.toDomain;
  };
}
