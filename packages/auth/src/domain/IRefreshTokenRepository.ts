import type {
    TDeleteRefreshToken,
    TFindRefreshToken,
    TSaveRefreshToken
} from "../authFunctions.types";
import type {IMongoRepoWithDocMapper} from "@sh3pherd/shared-utils";
import type {Collection} from "mongodb";
import type {TRefreshTokenDomainModel} from "./refreshToken.types";

export interface IRefreshTokenRepository {
    saveRefreshToken: TSaveRefreshToken;
    findRefreshToken: TFindRefreshToken;
    deleteRefreshToken: TDeleteRefreshToken;
}

export interface IRefreshTokenMongoRepositoryDeps extends IMongoRepoWithDocMapper {
    refreshTokenCollection: Collection<TRefreshTokenDomainModel>;
}