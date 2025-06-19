import { randomUUID } from 'crypto';

export const generateTypedId = <T extends string>(prefix: T): `${T}_${string}` =>
  `${prefix}_${randomUUID()}` as const;
