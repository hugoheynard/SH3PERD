import { z } from 'zod';

/**
 * A Zod schema whose **parsed output** is `T`.
 *
 * Use this instead of `z.ZodType<T>` when the schema's input type differs
 * from its output — which is always the case when schemas contain transforms
 * (e.g. ID schemas that cast `string` → branded type, `z.coerce.date()`, etc.).
 *
 * `z.ZodType<T>` defaults to `z.ZodType<T, ZodTypeDef, T>`, enforcing that
 * both input and output match `T`. `ZodOutput<T>` only constrains the output.
 *
 * @example
 * export const SCompanyAdmin: ZodOutput<TCompanyAdmin> = z.object({ ... });
 * // SCompanyAdmin.parse(raw) returns TCompanyAdmin  ✅
 * // input type is unconstrained — accepts raw DB/API payloads  ✅
 */
export type ZodOutput<T> = z.ZodType<T, z.ZodTypeDef, unknown>;
