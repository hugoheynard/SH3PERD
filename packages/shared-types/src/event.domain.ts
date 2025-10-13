import { z } from 'zod';
import type { TUserId } from './user/user.domain.js';
import type { TRecordMetadata } from './metadata.types.js';
import type { TContractId } from './contracts.domain.types.js';

/**
 * PRESENTATION OF THE CALENDAR BUILDING BLOCKS:
 * Event Units are the building blocks of the calendar. They represent the relation between a timeframe and one / many users.
 *
 * An EventMatrix is a collection of Event Units that represents a division of a timeframe into smaller chunks attributed to one or more users.
 * For example, an EventMatrix could represent:
 * -> a week of rehearsals for a theater production, with each Event Unit representing a specific rehearsal session.
 * -> a timeframe split between multiple users, according to a time schema (e.g. split equally, 20min work -> 20min break, etc.)
 * The goal of an EventMatrix is to provide a structured way to organize and visualize the allocation of time and resources within a given period, to insure a non-interrupted workflow.
 */


export const SEventUnitId = z.custom<`eventUnit_${string}`>(
  (val): val is `eventUnit_${string}` =>
    typeof val === "string" && val.startsWith("eventUnit_"), { message: 'Invalid eventUnit_id format. Expected format: eventUnit_<unique_identifier>' }
);

export type TEventUnitId = `eventUnit_${string}`;

/**
 * Event Unit Domain Model
 * Represents a scheduled event involving one or more participants within a specific timeframe.
 */
export type TEventUnitDomainModel = {
  id: TEventUnitId;
  title: string;
  description?: string;
  category: 'off' | 'work';
  startDate: Date;
  endDate: Date;
  participants: TContractId[];
  //isLocked: boolean; // if true, no one can edit the event unit, passed events are locked
  //type: TEventType;
  //playlist: TEventPlaylist | null;
  //location: string; // depends on company available performance spots or follow(wherever stuff happens)
};

export type TEventUnitRecord = TEventUnitDomainModel & TRecordMetadata;

export type TEventType = 'rehearsal' | 'show' | 'meeting' | 'administrative';
export type TEventPlaylist = {
  needs: boolean; // if true, playlist is required
  assigned: boolean; // if true, playlist is set,
  playlist_id?: string; // playlist_id -> if not warning soft front end: "set playlist"
  validated: boolean; // if true, playlist is validated by manager
};




export type TEventPairs = `${TEventUnitId}-${TEventUnitId}`;




export type TEventMatrixDomainModel = {
  eventMatrix_id: `eventMatrix_${string}`;
  title: string;
  description?: string;
  startDate: Date; // start of the matrix
  endDate: Date; // end of the matrix
  participants: TUserId[]; // users involved in the matrix
  eventUnits: TEventUnitDomainModel[]; // event units within the matrix
}



export type TCalendarDomainModel = { user_id: TUserId,  participatesIn: TEventUnitId[]; }

export type TCalendarDataResponseDTO = {
  calendars: Record<TUserId, TCalendarDomainModel>
  events: Record<TEventUnitId, TEventUnitDomainModel>;
}