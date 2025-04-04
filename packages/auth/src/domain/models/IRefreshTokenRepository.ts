import type {TRevokeRefreshTokenFunction} from "./function.types";
import type {IMongoRepoWithDocMapper} from "@sh3pherd/shared-utils";
import type {Collection} from "mongodb";
import type {TRefreshToken, TRefreshTokenRecord} from "./refreshToken.types";

export interface IRefreshTokenRepository {
    saveRefreshToken: (input: { refreshTokenRecord: TRefreshTokenRecord }) => Promise<{ success: boolean }>;
    findRefreshToken: (input: { refreshToken: TRefreshToken }) => Promise<TRefreshTokenRecord | null>;
    revokeRefreshToken: TRevokeRefreshTokenFunction;
}

export interface IRefreshTokenMongoRepositoryInput extends IMongoRepoWithDocMapper {
    refreshTokenCollection: Collection<TRefreshTokenRecord>;
}