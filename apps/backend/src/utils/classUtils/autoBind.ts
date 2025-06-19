/**
 * Decorator that automatically binds all public methods of a class
 * to the class instance.
 *
 * Usage:
 *
 * @autoBind
 * export class MyController {
 *   ...
 * }
 */
export function autoBind<T extends new (...args: any[]) => object>(constructor: T): T {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);

      const prototype = constructor.prototype;
      const propertyNames = Object.getOwnPropertyNames(prototype) as (keyof typeof prototype)[];

      for (const propertyName of propertyNames) {
        if (propertyName === 'constructor') continue;

        const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
        const isFunction = descriptor && typeof descriptor.value === 'function';

        if (isFunction) {
          const value = (this as any)[propertyName]; // toujours obligé ici
          if (typeof value === 'function') {
            (this as any)[propertyName] = value.bind(this);
          }
        }
      }
    }
  } as T;
}
