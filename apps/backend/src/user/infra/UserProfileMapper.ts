import type { TUserProfileRecord } from '@sh3pherd/shared-types';
import { UserProfileEntity } from '../domain/UserProfileEntity.js';
import { UserProfileAggregateRoot } from '../domain/UserProfileAggregateRoot.js';
import { UserProfilePolicy } from '../domain/UserProfilePolicy.js';


/**
 * Mapper class for converting between UserProfile records, entities, and aggregate roots.
 */
export class UserProfileMapper {

  static recordToEntity(record: TUserProfileRecord): UserProfileEntity {
    return UserProfileEntity.fromRecord(record);
  };

  static recordToAggregate(record: TUserProfileRecord, policy?: UserProfilePolicy): UserProfileAggregateRoot {
    return new UserProfileAggregateRoot(
      UserProfileMapper.recordToEntity(record),
      policy ? policy : new UserProfilePolicy(),
    );
  };
}