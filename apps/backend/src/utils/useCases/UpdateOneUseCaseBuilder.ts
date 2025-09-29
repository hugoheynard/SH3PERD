import type { TUserId } from "@sh3pherd/shared-types";
import { RecordMetadataUtils } from '../metaData/RecordMetadataUtils.js';
import type { Filter, UpdateFilter } from 'mongodb';
import type { TPermissionKey } from '../../permissions/permissionsRegistry.js';


export type TGenericUpdateOneUseCase<T> = (input: {
  asker_id: TUserId,
  permission: TPermissionKey,
  filter: Partial<T>,
  update: Partial<T>
}) => Promise<T | null>;


/**
 * exemple permission
 * user::preferences::write::self
 */
export class UpdateOneUseCaseBuilder<TRecord> {
  private permissionCheck?: {
    fn: (asker_id: TUserId, permission: TPermissionKey) => Promise<boolean>;
    error?: string
  };

  private repoUpdate?: {
    fn: (input: { filter: Partial<TRecord> | Filter<TRecord>, update: Partial<TRecord> }) => Promise<TRecord | null>;
    error?: string;
  };

  private postProcessors: ((doc: TRecord) => TRecord)[] = [];

  /**
   * Build the use case function, returning a function that performs the update operation
   * with permission checks and post-processing.
   */
  build(): TGenericUpdateOneUseCase<TRecord> {
    return async (input) => {
      const { asker_id, permission, filter, update } = input;


      if (this.permissionCheck) {
        const ok = await this.permissionCheck.fn(asker_id, permission);

        if (!ok) {
          throw new Error(this.permissionCheck.error);
        }
      }


      // 3. Repo
      if (!this.repoUpdate) {
        throw new Error("REPO_NOT_CONFIGURED");
      }
      const result = await this.repoUpdate.fn({
        filter,
        update: {
          ...update,
          ...RecordMetadataUtils.patchUpdate()
        }
      });

      if (!result) {
        throw new Error(this.repoUpdate.error);
      }

      return result;
      // 4. Post processing
      //return this.postProcessors.reduce((acc, fn) => fn(acc), result);
    }
  };

  /**
   * Permission check function to verify if the action is allowed
   * @param input
   */
  withPermissionCheck(input: {
    fn: (asker_id: TUserId,  action: TPermissionKey ) => Promise<boolean> ,
    error?: string
  }): this {
    if (!this.permissionCheck) {
      this.permissionCheck = {
        fn: async () => true,
        error: 'PERMISSION_CHECK_NOT_CONFIGURED'
      };
    }

    this.permissionCheck = input;
    return this;
  };

  /**
   * Repository function to update the document
   * @param input
   */
  withRepoUpdateFn(input: {
    fn: (input: { filter: Partial<TRecord> | Filter<TRecord>, update: Partial<TRecord> | UpdateFilter<TRecord>}) => Promise<TRecord | null>;
    error?: string
  }): this {
    if (this.repoUpdate?.fn) {
      throw new Error("REPO_ALREADY_CONFIGURED");
    }

    this.repoUpdate = input;
    return this;
  };

  /**
   * Post treatment of the document before returning it
   * @param fn
   */
  withPostProcessing(fn: (doc: TRecord) => TRecord) {
    this.postProcessors.push(fn);
    return this;
  };
}