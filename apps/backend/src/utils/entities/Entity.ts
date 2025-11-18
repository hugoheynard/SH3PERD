import { randomUUID } from 'crypto';
import { RecordMetadataUtils } from '../metaData/RecordMetadataUtils.js';
import type { TRecordMetadata } from '@sh3pherd/shared-types';
import { AggregateRoot, EventBus } from '@nestjs/cqrs';
import { EntityUtils } from './EntityUtils.js';


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
export abstract class Entity<TDomainModel extends {id: TDomainModel['id']}> extends AggregateRoot {
  protected readonly _originalProps: TDomainModel;
  protected props: TDomainModel;
  protected readonly utils = EntityUtils;

  protected constructor(props: TEntityInput<TDomainModel>, prefix: string) {
    super();
    const id = props.id ?? this.generateId(prefix);
    this.props = { ...props, id } as TDomainModel;
    this._originalProps = { ...this.props, id  } as TDomainModel;
  };

  /** Snapshot */
  get toDomain(): TDomainModel {
    return { ...this.props };
  };

  get id(): TDomainModel['id'] {
    return this.props.id;
  };

  //--- Compare methods ---//
  getDiffProps(): Record<string, any> {
    return this.utils.deepDiffToDotSet(this._originalProps, this.props );
  };


  //--- Private Methods ---//
  /**
   * Generates a unique ID with the given prefix.
   * @param prefix
   * @private
   */
  private generateId(prefix: string): TDomainModel['id'] {
    return `${prefix}_${randomUUID()}`;
  };

  /**
   * Generic factory to construct an Entity from a DB record,
   * stripping metadata fields.
   */
  static fromRecord<
    TRecord extends TRecordMetadata & Record<string, unknown>,
    TEntity extends Entity<any>
  >(
    this: new (props: Omit<TRecord, keyof TRecordMetadata>) => TEntity,
    record: TRecord
  ): TEntity {
    const cleanProps = RecordMetadataUtils.stripDocMetadata(record);
    return new this(cleanProps);
  };


}


/**
 * Abstract base class for aggregate entities.
 * Extends the base Entity class and adds event committing functionality.
 */
export abstract class AggregateEntity<TDomainModel extends { id: TDomainModel['id'] }> extends Entity<TDomainModel> {
  commitEvents(eventBus: EventBus): void {
    eventBus.publishAll(this.getUncommittedEvents());
    this.commit();
  }
}

