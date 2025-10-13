import type { TUserId } from './user/user.domain.js';
//import type { TRecordMetadata } from './metadata.types.js';

export type TRefreshToken = `refreshToken_${string}`;

export type TRefreshTokenDomainModel = {
  id: TRefreshToken;
  refreshToken: TRefreshToken;
  user_id: TUserId;
  expiresAt: Date;
  createdAt: Date;
};

export type TRefreshTokenRecord = TRefreshTokenDomainModel //& TRecordMetadata