/*
import { BaseCRUDUseCaseBuilder } from './BaseCRUDUseCaseBuilder.js';
import type { Filter } from 'mongodb';
import type { TGenericRepoFindOneFn } from '../repoAdaptersHelpers/repository.genericFunctions.types.js';


export class FindOneUseCaseBuilder<TRecord>
  extends BaseCRUDUseCaseBuilder<TGenericRepoFindOneFn<TRecord>> {

  protected override async processCoreFn(input: { filter: Partial<TRecord> | Filter<TRecord> }): Promise<ReturnType<TGenericRepoFindOneFn<TRecord>>> {
    const { filter } = input;

    if (!this.repo) {
      throw new Error("REPO_NOT_CONFIGURED");
    }
    const result = await this.repo.fn({
      filter
    });

    if (!result) {
      throw new Error(this.repo.error);
    }

    return result;
  }
}

 */
