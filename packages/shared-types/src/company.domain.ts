import { z } from 'zod';
import type { TRecordMetadata } from './metadata.types.js';

export const SCompanyId = z.string().regex(
  /^company_[a-zA-Z0-9_-]+$/,
  { message: 'Invalid company_id format' }
);

export type TCompanyId = z.infer<typeof SCompanyId>;

export const SCompanyDomainModel = z.object({
  company_id: SCompanyId,
})

export type TCompanyDomainModel = z.infer<typeof SCompanyDomainModel>;


export type TCompanyRecord = TCompanyDomainModel & TRecordMetadata;