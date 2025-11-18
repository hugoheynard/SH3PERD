import { technicalFailThrows500 } from '../../utils/errorManagement/tryCatch/technicalFailThrows500.js';
import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserProfileRecord, TUserProfileDomainModel, TUserId, TRecordMetadata} from '@sh3pherd/shared-types';
import { Injectable } from '@nestjs/common';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import { UserProfileAggregateRoot } from '../domain/UserProfileAggregateRoot.js';
import { UserProfileMapper } from './UserProfileMapper.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';


export interface IUserProfileRepository extends IBaseCRUD<TUserProfileRecord>{
  saveUserProfileFromAR: (ar: UserProfileAggregateRoot, meta: TRecordMetadata) => Promise<TUserProfileDomainModel | false>;
  findOneArByUserId: (user_id: TUserId) => Promise<UserProfileAggregateRoot | null>;
  findOneViewModelByUserId: (user_id: TUserId) => Promise<TUserProfileDomainModel | null>
  updateOneFromAR: (ar: UserProfileAggregateRoot) => Promise<TUserProfileDomainModel | null>;
}

@Injectable()
export class UserProfileMongoRepository
  extends BaseMongoRepository<TUserProfileRecord>
  implements IUserProfileRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  };

  /**
   * saves a user profile to the database.
   * @param ar
   * @param meta
   * */
  @technicalFailThrows500('USER_PROFILE_SAVE_FAILED')
  public async saveUserProfileFromAR(ar: UserProfileAggregateRoot, meta: TRecordMetadata): Promise<TUserProfileDomainModel | false> {
    const doc = ar.snapshot

    const result = await this.save({
      ...doc,
      ...meta
    });

    if (!result) {
      return false;
    }

    ar.commit();

    return doc;
  };


  /**
   * Finds one UserProfileAggregateRoot by user ID.
   * @param user_id
   * @return {Promise<UserProfileAggregateRoot | null>}
   */
  @technicalFailThrows500('USER_PROFILE_REPO_FIND_BY_ID_FAILED')
  async findOneArByUserId(user_id: TUserId): Promise<UserProfileAggregateRoot | null> {
    const result = await this.findOne({ filter: { user_id } });

    if (!result) {
      return null;
    }

    return UserProfileMapper.recordToAggregate(result);
  };

  @technicalFailThrows500('USER_PROFILE_REPO_FIND_BY_ID_FAILED')
  async findOneViewModelByUserId(user_id: TUserId): Promise<TUserProfileDomainModel | null> {
    const result = await this.findOne({ filter: { user_id } });

    if (!result) {
      return null;
    }

    return RecordMetadataUtils.stripDocMetadata(result);
  };

  /**
   * Updates one user profile from an aggregate root.
   * @param ar
   * @param meta
   */
  async updateOneFromAR(ar: UserProfileAggregateRoot): Promise<TUserProfileDomainModel | null> {

    const result = await this.updateOne({
      filter: { id: ar.id },
      update: { $set: { ...ar.getUpdateObject(), ...RecordMetadataUtils.update() } }
    });

    if (!result) {
      return null;
    }

    ar.commit();
    return RecordMetadataUtils.stripDocMetadata(result);
  };

}