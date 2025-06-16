import {autoBind} from "../../../../utils/classUtils/autoBind.js";
import {BaseMongoRepository} from "../../../../utils/repoAdaptersHelpers/BaseMongoRepository.js";
import type {TUserDomainModel} from "../../../types/user.domain.types.js";
import type {IUserRepository, TFindUserByEmailFn, TUserMongoRepositoryDeps} from "../../../types/user.core.repo.js";
import {failThrows500} from "../../../../utils/errorManagement/tryCatch/failThrows500.js";

@autoBind
export class UserMongoRepository
    extends BaseMongoRepository<TUserDomainModel>
    implements IUserRepository {

    constructor(input: TUserMongoRepositoryDeps) {
        super(input);
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
        return await this.findDocBy(filter);
    };

}