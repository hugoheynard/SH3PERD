import type { TUserId } from '@sh3pherd/shared-types';
import { RecordMetadataUtils } from '../metaData/RecordMetadataUtils.js';
import type { Filter, UpdateFilter } from 'mongodb';
import type { TPermissionKey } from '../../permissions/permissionsRegistry.js';
import { BaseCRUDUseCaseBuilder } from './BaseCRUDUseCaseBuilder.js';
import type { TGenericRepoUpdateOneFn } from '../repoAdaptersHelpers/repository.genericFunctions.types.js';

export type TGenericUpdateOneUseCase<T> = (input: {
  asker_id: TUserId;
  permission: TPermissionKey;
  filter: Partial<T> | Filter<T>;
  update: Partial<T> | UpdateFilter<T>;
}) => Promise<T | null>;

export class UpdateOneUseCaseBuilder<TRecord> extends BaseCRUDUseCaseBuilder<
  TGenericUpdateOneUseCase<TRecord>,
  TGenericRepoUpdateOneFn<TRecord>
> {
  /**
   * Build the use case function, returning a function that performs the update operation
   * with permission checks and post-processing.
   */
  override build(): TGenericUpdateOneUseCase<TRecord> {
    return async (input) => {
      const { asker_id, permission, ...repoInput } = input;

      if (this.permissionCheck) {
        const ok = await this.permissionCheck.fn(asker_id, permission);

        if (!ok) {
          throw new Error(this.permissionCheck.error);
        }
      }

      const coreResult = await this.processCoreFn(repoInput);
      // 4. Post processing
      //return this.postProcessors.reduce((acc, fn) => fn(acc), result);

      return coreResult;
    };
  }

  protected override async processCoreFn(
    input: Parameters<TGenericRepoUpdateOneFn<TRecord>>[0],
  ): Promise<ReturnType<TGenericRepoUpdateOneFn<TRecord>>> {
    const { filter, update } = input;

    if (!this.repo) {
      throw new Error('REPO_NOT_CONFIGURED');
    }

    const result = await this.repo.fn({
      filter,
      update: {
        ...update,
        ...RecordMetadataUtils.patchUpdate(),
      },
    });

    if (!result) {
      throw new Error(this.repo.error);
    }

    return result;
  }
}
