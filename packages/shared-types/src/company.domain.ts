import { z } from 'zod';
import type { TRecordMetadata } from './metadata.types.js';
import { createIdSchema } from './utils/createIdSchema.js';

export const SCompanyId = createIdSchema('company');

export type TCompanyId = `company_${string}`;

export const SCompanyDomainModel = z.object({
  id: SCompanyId,
})

export type TCompanyDomainModel = {
  id: TCompanyId;
  name: string;
};


export type TCompanyRecord = TCompanyDomainModel & TRecordMetadata;