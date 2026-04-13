/*
import { Entity } from './Entity.js';

type PropsOf<T extends Entity<any, any>> = T extends Entity<infer M, any> ? Omit<M, "id"> : never;


export class MutationControlledEntity<TDomainModel, TPrefix, > extends Entity<TDomainModel, TPrefix>{
  private readonly immutableProps: ReadonlySet<keyof PropsOf<this>>;

  protected constructor(
    prefix: TPrefix,
    props: TDomainModel,
    immutableProps: readonly (keyof Omit<TDomainModel, "id">)[] = []
  ) {
    super(prefix, props)
    this.immutableProps = new Set(immutableProps);
  }

  ///--- Immutability Enforcement ---//

  // Override in subclass to define always-immutable keys
  // protected static readonly immutableProps: readonly (keyof TDomainModel)[] = [];

  protected isMutable<K extends keyof PropsOf<this>>(key: K): boolean {
    return !this.immutableProps.has(key) //&& this.isMutableConditionally(key);
  }
  //Optional: override to apply conditional immutability logic




  protected isMutable<K extends keyof PropsOf<this>>(key: K): boolean {
    const ctor = this.constructor as typeof Entity;
    const staticImmutable = ctor.immutableProps.includes(key as string);
    return !staticImmutable && this.isMutableConditionally(key);
  }

  protected updateProp<K extends keyof PropsOf<this>>(
    key: K,
    value: PropsOf<this>[K]
  ): void {
    if (!this.isMutable(key)) {
      throw new Error(`Property "${String(key)}" is immutable in the current context.`);
    }
    this.props[key] = value;
  };

}
*/
