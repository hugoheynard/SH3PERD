import {TUserId_shared} from "@sh3pherd/shared-types";

export type TRefreshToken = `refreshToken_${string}`;

export type TRefreshTokenDomainModel = {
    refreshToken: TRefreshToken;
    user_id: TUserId_shared;
    expiresAt: Date;
    createdAt: Date;
}


