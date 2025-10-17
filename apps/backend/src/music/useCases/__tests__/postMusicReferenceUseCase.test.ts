
import type { TUserId } from '@sh3pherd/shared-types';
import {jest } from '@jest/globals';
import { createCreateOneMusicReferenceUseCase } from '../references/createCreateOneMusicReferenceUseCase.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';

describe('createPostMusicReferenceUseCase', () => {
  const asker_id: TUserId = 'user_123';
  const payload = { title: 'Imagine', artist: 'John Lennon' };

  it('should create a music reference successfully', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);

    const useCase = createCreateOneMusicReferenceUseCase({
      saveOneMusicReferenceFn: mockSave,
    });

    const result = await useCase(asker_id, payload);

    expect(result.title).toBe('Imagine');
    expect(result.artist).toBe('John Lennon');
    expect(result.created_by).toBe(asker_id);
    expect(result.music_id).toMatch(/^musicReference_/);
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining(payload), undefined);
  });

  it('should throw BusinessError if title or artist is missing', async () => {
    const useCase = createCreateOneMusicReferenceUseCase({
      saveOneMusicReferenceFn: jest.fn(),
    });

    await expect(useCase(asker_id, { title: '', artist: '' })).rejects.toThrow(BusinessError);
  });

  it('should throw TechnicalError if saveOne returns false', async () => {
    const mockSave = jest.fn().mockResolvedValue(false);
    const useCase = createCreateOneMusicReferenceUseCase({ saveOneMusicReferenceFn: mockSave });

    await expect(useCase(asker_id, payload)).rejects.toThrow(TechnicalError);
  });

  it('should wrap unknown errors as generic Error', async () => {
    const mockSave = jest.fn().mockRejectedValue('weird failure');
    const useCase = createCreateOneMusicReferenceUseCase({ saveOneMusicReferenceFn: mockSave });

    await expect(useCase(asker_id, payload)).rejects.toThrow('Unknown error while creating music reference');
  });
});
