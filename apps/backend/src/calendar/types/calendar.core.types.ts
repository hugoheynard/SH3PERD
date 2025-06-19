import type { TEventUnitDomainModel } from './eventUnits.domain.types.js';

/**
 * @description
 * This interface defines the contract for an event collider.
 * It is responsible for managing the context and executing events.
 *
 * @template TColliderContext - The type of the context used by the collider.
 * @template TColliderResult - The type of the result returned by the collider.
 */

export type IEventCollider<TColliderContext, TColliderResult> = {
  setContext(context: TColliderContext): void;
  addEvent(event: TEventUnitDomainModel): void;
  execute(): TColliderResult;
};
