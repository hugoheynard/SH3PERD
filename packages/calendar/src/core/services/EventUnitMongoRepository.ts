import {BaseMongoRepository} from "@sh3pherd/shared-utils";
import type {TUserId} from "@sh3pherd/shared-types";

export type TEventUnitId = `eventUnit_${string}`;
export type TEventType = 'rehearsal' | 'show' | 'meeting' | 'administrative';
export type TEventPlaylist = {
    needs: boolean; // if true, playlist is required
    assigned: boolean; // if true, playlist is set,
    playlist_id?: string // playlist_id -> if not warning soft front end: "set playlist"
    validated: boolean; // if true, playlist is validated by manager
}

export type TEventUnitDomainModel = {
    eventUnit_id: TEventUnitId | null;
    title: string | null;
    description: string | null;
    type: TEventType;
    contract_id: string | null; // contract_id required, the contract endDate will determine if you're able to create an event unit
    needsPlaylist: boolean | null; // conditioned by type
    playlist: TEventPlaylist | null;
    location: string; // depends on company available performance spots or follow(wherever stuff happens)
    startDate: Date;
    endDate: Date;
    participants: TUserId[];
    isLocked: boolean; // if true, no one can edit the event unit, passed events are locked
    creator_id: TUserId;
    createdAt: Date;
    lastModifiedAt: Date;
}

export class EventUnitMongoRepository
    extends BaseMongoRepository<TEventUnitDomainModel> {

    constructor(input: { collection }) {
        super(collection);
    }
}

/**
 *
 */


export const EVENT_UNIT_DEFAULT: Readonly<IPlaylistSettings> = Object.freeze({
    eventUnit_id: null,
    name: `New Event ${new Date().toLocaleDateString()}` as string,
    description: null,
});