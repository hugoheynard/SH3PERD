import type { UpdateFilter } from 'mongodb';

type MongoSet<T> = NonNullable<UpdateFilter<T>['$set']>;
type MongoInc<T> = NonNullable<UpdateFilter<T>['$inc']>;
type MongoUnset<T> = NonNullable<UpdateFilter<T>['$unset']>;

/**
 * Construit les paths possibles dans un objet T
 * Exemple : "preferences.theme" | "preferences.contract_workspace" | "days"
 */
type NestedKeys<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends object
    ? `${Prefix}${K}` | NestedKeys<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

/*
export type UpdateOps<T> = {
  set?: (keyof T | string)[];
  inc?: (keyof T | string)[];
  unset?: (keyof T | string)[];
  values: Partial<T>; // les valeurs réelles du DTO
};

 */
export type UpdateOps<T> = {
  set?: NestedKeys<T>[];
  inc?: NestedKeys<T>[];
  unset?: NestedKeys<T>[];
  values: Partial<T>;
};

export function toMongoUpdateAdapter<T extends object>(ops: UpdateOps<T>): UpdateFilter<T> {
  const mongoUpdate: UpdateFilter<T> = {};

  if (ops.set?.length) {
    const setOps: Record<string, unknown> = {};

    for (const key of ops.set) {
      const value = getNestedValue(ops.values, key);
      if (value !== undefined) {
        setOps[key] = value;
      }
    }

    if (Object.keys(setOps).length > 0) {
      mongoUpdate.$set = setOps as MongoSet<T>;
    }
  }

  if (ops.inc?.length) {
    const incOps: Record<string, number> = {};
    for (const key of ops.inc) {
      const value = getNestedValue(ops.values, key);
      if (typeof value === 'number') {
        incOps[key] = value;
      }
    }
    if (Object.keys(incOps).length > 0) {
      mongoUpdate.$inc = incOps as MongoInc<T>;
    }
  }

  if (ops.unset?.length) {
    const unsetOps: Record<string, '' | 1 | true> = {};
    for (const key of ops.unset) {
      unsetOps[key] = '';
    }
    if (Object.keys(unsetOps).length > 0) {
      mongoUpdate.$unset = unsetOps as MongoUnset<T>;
    }
  }

  return mongoUpdate;
}

/**
 * Récupère une valeur dans un objet à partir d'une clé ou d'un path
 * (supporte 'preferences.theme')
 */
function getNestedValue(obj: object, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (typeof acc !== 'object' || acc === null) {
      return undefined;
    }
    return (acc as Record<string, unknown>)[part];
  }, obj);
}
