import { randomUUID } from 'crypto';

export type TId<T extends string> = `${T}_${string}`;

/**
 * Type for entity input, making `id` optional from the domain model type.
 * @template TDomainModel - Shape of the domain model including the `id` field.
 * @example
 * // Given a domain model
 * type TUserDomainModel = {
 *    id: TId<'user'>;
 *    name: string;
  *   email: string;
 *   };
 *
 *    // The corresponding input type would be:
 *    type TUserInput = TEntityInput<TUserDomainModel>;
 *
 *    // This is equivalent to:
 *    type TUserInput = {
 *    id?: TId<'user'>; // Optional ID
 *    name: string;
 *    email: string;
 *    };
 *
 */
export type TEntityInput<
  TDomainModel extends { id: unknown }
> = Omit<TDomainModel, 'id'> & { id?: TDomainModel['id'] };

/**
 * Abstract base class for all domain entities.
 * Generates a unique ID if not provided.
 * @template TDomainModel - Shape of the domain model including the `id` field MANDATORY.
 * @template TPrefix - String literal prefix for the entity ID.
 * note:
 * -> I know props is ok with the cast only ! sorry TS
 */
export abstract class Entity<TDomainModel extends {id: TDomainModel['id']}> {
  protected props: TDomainModel;

  protected constructor(props: TEntityInput<TDomainModel>, prefix: string) {
    const id = props.id ?? this.generateId(prefix);
    this.props = { ...props, id } as TDomainModel;
  };

  /** Snapshot */
  get toDomain(): TDomainModel {
    return { ...this.props };
  };

  get id(): TDomainModel['id'] {
    return this.props.id;
  };

  private generateId(prefix: string): TDomainModel['id'] {
    return `${prefix}_${randomUUID()}`;
  };
}