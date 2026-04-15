import { BaseUseCaseBuilder } from './BaseUseCaseBuilder.js';

export type RepoConfig<TFn> = {
  fn: TFn;
  error?: string;
};

export class BaseCRUDUseCaseBuilder<
  TFn extends (...args: never[]) => Promise<unknown>,
  TRepoFn extends (...args: never[]) => Promise<unknown>,
> extends BaseUseCaseBuilder<TFn> {
  repo?: RepoConfig<TRepoFn>;
  private postProcessors: ((doc: Awaited<ReturnType<TRepoFn>>) => ReturnType<TFn>)[] = [];

  /**
   * Configure the repository function to be used in the use case
   * @param input
   */
  withRepo(input: RepoConfig<TRepoFn>): this {
    if (this.repo?.fn) {
      throw new Error('REPO_FN_ALREADY_CONFIGURED');
    }

    this.repo = input;
    return this;
  }

  /**
   * Core processing function that invokes the configured repository function
   * should be called within the built use case function
   * can be overridden in subclasses for custom behavior
   * @param input
   */
  protected async processCoreFn(
    input: Parameters<TRepoFn>[0],
  ): Promise<Awaited<ReturnType<TRepoFn>>> {
    if (!this.repo) {
      throw new Error('REPO_NOT_CONFIGURED');
    }

    return (await this.repo.fn(input)) as Awaited<ReturnType<TRepoFn>>;
  }

  /**
   * Post treatment of the document before returning it
   * @param fn
   */
  withPostProcessing(fn: (doc: Awaited<ReturnType<TRepoFn>>) => ReturnType<TFn>): this {
    this.postProcessors.push(fn);
    return this;
  }
}
