import { createEventUnitUseCaseFactory } from './createEventUnit.js';
import { RepositoryContainer } from '../../appBootstrap/core_modules/repositories/RepositoryContainer.js';

const eventUnitRepo = RepositoryContainer.get('eventUnit');

export const createEventUnit = createEventUnitUseCaseFactory({
  saveEventUnit: (input: any) => eventUnitRepo.save(input),
});
