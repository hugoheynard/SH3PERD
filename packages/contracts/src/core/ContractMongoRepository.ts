import {BaseMongoRepository, failThrows500} from "@sh3pherd/shared-utils";
import type {
    IContractRepository,
    TContractDomainModel,
    TContractMongoRepositoryDeps, TMarkContractAsFavoriteFn, TUnmarkContractAsFavoriteFn,
    TUserId
} from "@sh3pherd/shared-types";
import type {WithId} from "mongodb";

export class ContractMongoRepository
    extends BaseMongoRepository<TContractDomainModel>
    implements IContractRepository {

    constructor(input: TContractMongoRepositoryDeps) {
        super(input);
    };

    @failThrows500('', '')
    async findById(filter: any) {
        const contract = await this.collection.findOne(filter);
        if (!contract) {
            return null
        }
        return contract;
    };

    @failThrows500('FIND_FAVORITE_USER_CONTRACT_FAILED', 'Error while finding favorite user contract')
    async findUsersFavorite(user_id: TUserId): Promise<TContractDomainModel | null> {
        const result =  await this.findDocBy({
            user_id,
            favorite: true
        })

        if (!result) {
            return null
        }
        return result;
    };


    @failThrows500('MARK_CONTRACT_AS_FAVORITE_FAILED', 'Error while marking as favorite')
    async markAsFavorite(input: Parameters<TMarkContractAsFavoriteFn>[0]): ReturnType<TMarkContractAsFavoriteFn> {
        const { contract_id, user_id } = input;

        let updatedDoc: Omit<TContractDomainModel, '_id'> | null = null;

        const session = this.client.startSession();
        try {
            await session.withTransaction(async () => {
                await this.collection.updateMany(
                    { user_id ,favorite: true },
                    { $set: { favorite: false } },
                    { session }
                );

                const result: WithId<TContractDomainModel> = await this.collection.findOneAndUpdate(
                    { contract_id },
                    { $set: { favorite: true } },
                    {
                        returnDocument: 'after',
                        session,
                    }
                );

                if (result.value) {
                    updatedDoc = result.value;
                }
            });
        } finally {
            await session.endSession();
        }

        return updatedDoc;

    };


}