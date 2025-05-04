import type {
    IUserRepository,
    TFindUserByEmailFn,
    TUserDomainModel,
    TUserMongoRepositoryDeps
} from "@sh3pherd/shared-types";
import {autoBind, BaseMongoRepository, failThrows500} from "@sh3pherd/shared-utils";

@autoBind
export class UserMongoRepository
    extends BaseMongoRepository<TUserDomainModel>
    implements IUserRepository {

    constructor(input: TUserMongoRepositoryDeps) {
        super(input.userCollection);
    };

    @failThrows500('USER_SAVE_FAILED')
    public async saveUser(input: { user: TUserDomainModel }): Promise<boolean> {
        const result = await this.collection.insertOne(input.user);

        if (!result.acknowledged || !result.insertedId) {
            return false;
        }

        return true;
    };

    @failThrows500('USER_FIND_BY_EMAIL_FAILED')
    public async findUserByEmail(filter: Parameters<TFindUserByEmailFn>[0]): ReturnType<TFindUserByEmailFn>{
        return this.findDocBy(filter);
    };

}