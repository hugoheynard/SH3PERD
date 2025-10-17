import type { TContractId, TEventUnitId, TEventUnitDomainModel, TCalendarDomainModel } from '@sh3pherd/shared-types';

export type TBuildCalendarInput = {
  readonly eventUnits: readonly TEventUnitDomainModel[];
  readonly user_ids: readonly TContractId[];
};

export type TBuildCalendarOutput = {
  readonly calendars: Map<TContractId, TCalendarDomainModel>;
  readonly eventUnits: Map<TEventUnitId, TEventUnitDomainModel>;
};

export type TBuildCalendarFn = (input: TBuildCalendarInput) => TBuildCalendarOutput;

/**
 * Builds a user calendar from event participation data.
 * Pure, readonly-safe implementation.
 */
export function buildCalendar(input: TBuildCalendarInput): TBuildCalendarOutput {
  const { eventUnits, user_ids } = input;

  const eventUnitsMap: Map<TEventUnitId, TEventUnitDomainModel> = new Map();
  const calendarMap: Map<TContractId, { user_id: TContractId; participatesIn: TEventUnitId[] }> = new Map();
  const userSet: Set<TContractId> = new Set(user_ids);

  //builder logic
  for (const event of eventUnits) {
    if (!event.id) {
      console.warn(`Skipped event with missing eventUnit_id: ${JSON.stringify(event)}`);
      continue;
    }

    eventUnitsMap.set(event.id, event);

    for (const participant of event.participants || []) {
      //avoids creating planning for members in event but not in query
      if (!participant || !userSet.has(participant)) {
        continue;
      }

      //avoid creating duplicates, initialize if not present
      if (!calendarMap.has(participant)) {
        calendarMap.set(participant, { user_id: participant, participatesIn: [] });
      }

      //pushes eventUnit_id to the calendar
      calendarMap.get(participant)!.participatesIn.push(event.id);
    }
  }

  return {
    calendars: calendarMap,
    eventUnits: eventUnitsMap,
  };
}
