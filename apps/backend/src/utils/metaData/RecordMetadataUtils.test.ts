import type { TUserId } from '@sh3pherd/shared-types';
import { RecordMetadataUtils } from './RecordMetadataUtils.js';

describe('RecordMetadataUtils', () => {
  const creatorId: TUserId = 'user_123';

  describe('create', () => {
    it('should create a new metadata object with default fields', () => {
      const metadata = RecordMetadataUtils.create(creatorId);

      expect(metadata.created_by).toBe(creatorId);
      expect(metadata.created_at).toBeInstanceOf(Date);
      expect(metadata.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('update', () => {
    it('should update only the updated_at field', () => {
      const original = RecordMetadataUtils.create(creatorId);
      const updated = RecordMetadataUtils.update();

      expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(original.updated_at.getTime());
      expect(Object.keys(updated)).toEqual(['updated_at']);
    });
  });

  describe('softDelete', () => {
    it('should preserve metadata and update updated_at', () => {
      const original = RecordMetadataUtils.create(creatorId);
      const deleted = RecordMetadataUtils.softDelete(original);

      expect(deleted.created_at).toEqual(original.created_at);
      expect(deleted.created_by).toEqual(original.created_by);
      expect(deleted.updated_at.getTime()).toBeGreaterThanOrEqual(original.updated_at.getTime());
    });
  });

  describe('reactivate', () => {
    it('should preserve metadata and update updated_at', () => {
      const original = RecordMetadataUtils.softDelete(RecordMetadataUtils.create(creatorId));
      const reactivated = RecordMetadataUtils.reactivate(original);

      expect(reactivated.created_at).toEqual(original.created_at);
      expect(reactivated.created_by).toEqual(original.created_by);
      expect(reactivated.updated_at.getTime()).toBeGreaterThanOrEqual(
        original.updated_at.getTime(),
      );
    });
  });
});
