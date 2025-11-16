import type { TEventUnitDomainModel } from '@sh3pherd/shared-types';
import { EventUnitEntity } from '../domain/EventUnitEntity.js';
import type { TGenericSaveFn } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

/**
 * Use case factory.
 * @param deps
 */
export const createEventUnitUseCaseFactory = (deps: {
  saveEventUnit: TGenericSaveFn<TEventUnitDomainModel>
}) => {
  const { saveEventUnit } = deps;

  /**
   * Use case for creating an event unit.
   * @param deps
   */
  return async function createEventUnitUseCase(input: Omit<TEventUnitDomainModel, 'id'>): Promise<TEventUnitDomainModel> {
    const eventUnit = new EventUnitEntity(input);


    const result = await saveEventUnit(eventUnit.toDomain)

    if (!result) {
      throw new Error('Error saving event unit');
    }

    return eventUnit.toDomain;
  }
};



