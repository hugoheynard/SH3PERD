import type { TUserId } from '@sh3pherd/shared-types';
import type { TEventUnitDomainModel, TEventUnitId } from '../../types/eventUnits.domain.types.js';

export type TEventIntersectionColliderContext = {
  target_id: TUserId;
  intersectsWith: TUserId[];
};

export type TColliderContext = {
  eventIntersection?: TEventIntersectionColliderContext;
};

export type TEventIntersectionFn = (input: {
  readonly eventUnits: readonly TEventUnitDomainModel[];
  readonly context: TEventIntersectionColliderContext;
}) => Map<TEventUnitId, TEventUnitDomainModel>;

export type TCalendarServiceDeps = {
  buildCalendarFn: (input: {
    readonly eventUnits: readonly TEventUnitDomainModel[];
    readonly user_ids: readonly TUserId[];
  }) => {
    readonly calendars: Map<TUserId, { user_id: TUserId; participatesIn: TEventUnitId[] }>;
    readonly eventUnits: Map<TEventUnitId, TEventUnitDomainModel>;
  };
  colliderRegistry: {
    eventIntersection: TEventIntersectionFn;
  };
};

/**
 * Service to build a calendar from event participation data.
 */
export class CalendarService {
  private readonly deps: TCalendarServiceDeps;

  constructor(deps: TCalendarServiceDeps) {
    this.deps = deps;
  }

  build(input: {
    eventUnits: TEventUnitDomainModel[];
    user_ids: TUserId[];
    context?: TColliderContext;
  }): any {
    const { eventUnits, user_ids, context = {} } = input;

    const calendar = this.deps.buildCalendarFn({ eventUnits, user_ids });

    if (!context) {
      return calendar;
    }
    const { eventIntersection } = this.deps.colliderRegistry;

    // Dynamically handle optional colliders from context
    const colliders: any = {};

    if (context.eventIntersection) {
      colliders.eventIntersection = eventIntersection({
        eventUnits,
        context: context.eventIntersection,
      });
    }

    return {
      ...calendar,
      colliders,
    };
  }
}
