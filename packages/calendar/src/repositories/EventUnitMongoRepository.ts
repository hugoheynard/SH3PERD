import {BaseMongoRepository, failThrows500} from "@sh3pherd/shared-utils";
import type {TBaseMongoRepoDeps, TEventUnitDomainModel, TUserId} from "@sh3pherd/shared-types";


export class EventUnitMongoRepository
    extends BaseMongoRepository<TEventUnitDomainModel> {

    constructor(input: TBaseMongoRepoDeps) {
        super(input);
    };

    @failThrows500('FIND_EVENT_UNIT_FAILED', 'Error while finding event unit')
    async getEventUnits(input: { user_ids: TUserId[], startDate: Date, endDate: Date }): Promise<TEventUnitDomainModel[]> {
        const { user_ids, startDate, endDate } = input;

        return await this.collection.find({
            participants: { $in: user_ids },
            start: { $lt: endDate },
            end: { $gt: startDate }
        }).toArray();
    };
}

/**
 *
 */


export const EVENT_UNIT_DEFAULT: Readonly<any> = Object.freeze({
    eventUnit_id: null,
    name: `New Event ${new Date().toLocaleDateString()}` as string,
    description: null,
});