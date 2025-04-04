import type {UserId} from "@sh3pherd/user";

export type TRefreshToken = `refreshToken_${string}`;

export type TRefreshTokenRecord = {
    refreshToken: TRefreshToken;
    user_id: UserId;
    expiresAt: Date;
    createdAt: Date;
}


