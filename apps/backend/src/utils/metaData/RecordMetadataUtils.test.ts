import type { TRecordMetadata, TUserId } from '@sh3pherd/shared-types';
import { RecordMetadataUtils } from './RecordMetadataUtils.js';

describe('RecordMetadataUtils', () => {
  const creatorId: TUserId = 'user_123';

  describe('create', () => {
    it('should create a new metadata object with default fields', () => {
      const metadata = RecordMetadataUtils.create(creatorId);

      expect(metadata.created_by).toBe(creatorId);
      expect(metadata.created_at).toBeInstanceOf(Date);
      expect(metadata.updated_at).toBeInstanceOf(Date);
      expect(metadata.active).toBe(true);
    });
  });

  describe('update', () => {
    it('should update only the updated_at field', () => {
      const original = RecordMetadataUtils.create(creatorId);
      const updated = RecordMetadataUtils.update(original);

      expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(original.updated_at.getTime());
      expect(updated.created_at).toEqual(original.created_at);
      expect(updated.created_by).toEqual(original.created_by);
      expect(updated.active).toBe(original.active);
    });
  });

  describe('softDelete', () => {
    it('should set active to false and update updated_at', () => {
      const original = RecordMetadataUtils.create(creatorId);
      const deleted = RecordMetadataUtils.softDelete(original);

      expect(deleted.active).toBe(false);
      expect(deleted.updated_at.getTime()).toBeGreaterThanOrEqual(original.updated_at.getTime());
    });
  });

  describe('reactivate', () => {
    it('should set active to true and update updated_at', () => {
      const original = RecordMetadataUtils.softDelete(RecordMetadataUtils.create(creatorId));
      const reactivated = RecordMetadataUtils.reactivate(original);

      expect(reactivated.active).toBe(true);
      expect(reactivated.updated_at.getTime()).toBeGreaterThanOrEqual(
        original.updated_at.getTime(),
      );
    });
  });
});
