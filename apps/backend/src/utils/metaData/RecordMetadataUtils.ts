import type { TRecordMetadata, TUserId, TContractId } from '@sh3pherd/shared-types';

/**
 * Utility class to manage record metadata such as creation, update, and soft deletion timestamps.
 */
export class RecordMetadataUtils {
  /**
   * Creates a new metadata record with the given user ID as the creator.
   * Initializes `created_at`, `updated_at` to the current date, and sets `active` to true.
   *
   * @param creator_id - The ID of the user creating the record.
   * @param context - Optional contract context ID.
   * @returns A fully initialized metadata object.
   */
  static create(creator_id: TUserId, context?: TContractId): TRecordMetadata {
    const dateNow = new Date();

    return {
      created_by: creator_id,
      creation_context: context,
      created_at: dateNow,
      updated_at: dateNow,
    };
  }

  /**
   * Updates the `updated_at` field of the given metadata to the current date.
   *
   * @param metadata - The existing metadata to update.
   * @returns A new metadata object with an updated timestamp.
   */
  static update(): { updated_at: Date } {
    return {
      updated_at: new Date(),
    };
  }

  static patchUpdate(): Partial<TRecordMetadata> {
    return {
      updated_at: new Date(),
    };
  }

  /**
   * Marks the given metadata as inactive (`active = false`) without deleting it.
   *
   * @param metadata - The metadata to mark as deleted.
   * @returns A new metadata object with `active` set to false.
   */
  static softDelete(metadata: TRecordMetadata): TRecordMetadata {
    return {
      ...metadata,
      updated_at: new Date(),
    };
  }

  /**
   * Reactivates a previously soft-deleted metadata record by setting `active` to true.
   * @param metadata
   */
  static reactivate(metadata: TRecordMetadata): TRecordMetadata {
    return {
      ...metadata,
      updated_at: new Date(),
    };
  }

  static stripDocMetadata<TRecord extends object>(
    doc: TRecord & TRecordMetadata,
  ): Omit<TRecord, keyof TRecordMetadata> {
    const {
      created_at: _created_at,
      created_by: _created_by,
      creation_context: _creation_context,
      updated_at: _updated_at,
      ...domain
    } = doc;
    return domain;
  }

  static stripDocArrayMetadata<TDomain extends object>(
    docs: Array<TDomain & TRecordMetadata>,
  ): Omit<TDomain, keyof TRecordMetadata>[] {
    return docs.map(
      ({
        created_at: _created_at,
        created_by: _created_by,
        creation_context: _creation_context,
        updated_at: _updated_at,
        ...rest
      }) => rest,
    );
  }
}
