# Shared-Types — Conventions

## Type authoring pattern

### Principle

Types are written explicitly as the source of truth. Zod schemas implement them.

**Before (schema-first, opaque):**
```ts
export const SService = z.object({ id: SServiceId, name: z.string() });
export type TService = z.infer<typeof SService>; // unreadable without IDE hover
```

**After (type-first, explicit):**
```ts
/** A functional department within a company. */
export interface TService {
  id: TServiceId;
  /** Display name shown in the UI */
  name: string;
}
export const SService: z.ZodType<TService> = z.object({
  id:   SServiceId,
  name: z.string().min(1),
});
```

The interface is the documentation. `z.ZodType<T>` is the drift guard — if the
schema's output no longer matches the interface, TypeScript errors immediately.

---

## Rules

### 1. Always write the type first

The `interface` or `type` lives above its schema in the file.

### 2. Use `interface` for objects, `type` for unions

```ts
// ✅ object → interface
export interface TCompanyAdmin {
  user_id: TUserId;
  role: TCompanyAdminRole;
  joinedAt: Date;
}

// ✅ union / enum → type alias
export type TCompanyAdminRole = 'admin' | 'viewer';
export type TCompanyStatus = 'pending' | 'active' | 'suspended';
```

### 3. Annotate every schema with `ZodOutput<T>`

```ts
import type { ZodOutput } from './utils/zod.types.js';

export const SCompanyAdmin: ZodOutput<TCompanyAdmin> = z.object({ ... });
```

`ZodOutput<T>` is defined as `z.ZodType<T, ZodTypeDef, unknown>` — it constrains
only the **output** type of the schema, leaving the input unconstrained.

Why not `z.ZodType<T>` directly? `z.ZodType<T>` defaults to
`z.ZodType<T, ZodTypeDef, T>`, requiring both input and output to be `T`.
But our schemas accept raw payloads as input (plain `string` for IDs,
uncoerced values for dates) and transform them into typed output. The input
type never matches `T` exactly, so `z.ZodType<T>` fails at compile time.

`ZodOutput<T>` expresses the actual intent: *"parsing this schema produces a `T`"*.
A missing field or a wrong output type on the schema → TS error. ✅

### 4. ID schemas output the branded type

This is what makes `z.ZodType<T>` work on objects that contain branded ID
fields. `createIdSchema<TId>` adds a no-op `.transform(s => s as TId)` so
the schema's output type is the branded template literal, not plain `string`.

```ts
// ids.ts — type first, then schema
export type TCompanyId = `company_${string}`;
export const SCompanyId = createIdSchema<TCompanyId>('company');

// z.infer<typeof SCompanyId> === TCompanyId  ✅
// z.input<typeof SCompanyId> === string      ✅ (accepts plain strings at parse time)
```

Without this, all domain schemas would output plain `string` for ID fields,
and `z.ZodType<T>` would fail wherever `T` contains branded IDs.

### 5. `z.ZodType<T>` checks the output type, not the input

When a schema uses `.default(...)`, the field becomes optional in the input
but required in the output. `z.ZodType<T>` sees the output — so the interface
should declare the field as required:

```ts
export interface TCompanyDomainModel {
  services: TService[];   // required in output, even though schema uses .default([])
  status: TCompanyStatus; // required in output, even though schema uses .default('active')
}
export const SCompanyDomainModel: z.ZodType<TCompanyDomainModel> = z.object({
  services: z.array(SService).default([]),     // input can omit, output is always TService[]
  status:   SCompanyStatus.default('active'),  // input can omit, output is always TCompanyStatus
});
```

### 6. View models have no schema

View models are read-only projections built by use cases and returned to the
API layer. They are never parsed from external input, so no Zod schema is needed.
Write them as plain interfaces with JSDoc:

```ts
/** Full service projection — includes its teams and their active members */
export interface TServiceDetailViewModel {
  service_id: TServiceId;
  name: string;
  color?: string;
  teams: TServiceTeamViewModel[];
}
```

### 7. Record types are intersection types

MongoDB records extend the domain model with audit metadata.
Use `type` for this intersection (interfaces cannot express intersections):

```ts
/** MongoDB record — domain model extended with audit metadata */
export type TCompanyRecord = TCompanyDomainModel & TRecordMetadata;
```

---

## Naming conventions

| Prefix | Meaning | Example |
|--------|---------|---------|
| `T`    | TypeScript type or interface | `TService`, `TCompanyStatus` |
| `S`    | Zod schema | `SService`, `SCompanyStatus` |

Schema `SFoo` validates input and outputs a value conforming to `TFoo`.

---

## File structure

Within a domain file, the order is:

```
1. Imports
2. Enums / union types    (type alias + ZodType<T> schema)
3. Sub-objects            (interface + ZodType<T> schema)
4. Root domain model      (interface + ZodType<T> schema + Record type)
5. View models            (interfaces only — no schema)
6. Re-exports
```

---

## Known limitation — `fromRecord` and `Record<string, unknown>`

The generic `Entity.fromRecord<TRecord>()` requires
`TRecord extends TRecordMetadata & Record<string, unknown>`.

TypeScript does **not** automatically consider an `interface` to satisfy
`Record<string, unknown>` (unlike a type alias). When calling `fromRecord`
with a record type whose domain model is an interface, TypeScript cannot
infer the type parameter and falls back to the constraint bound.

**Fix:** cast at the call site:

```ts
// In a use case
const entity = CompanyEntity.fromRecord(
  record as typeof record & Record<string, unknown>
);
```

This is a structural cast (no runtime effect). The comment documents why it
exists. The underlying issue is a TypeScript inference limitation with
interfaces in generic contexts.
