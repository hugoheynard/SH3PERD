import {BaseMongoRepository} from "../../utils/repoAdaptersHelpers/BaseMongoRepository.js";
import type {TEventUnitDomainModel} from "../types/eventUnits.domain.types.js";
import type {TBaseMongoRepoDeps} from "../../types/mongo/mongo.types.js";
import {failThrows500} from "../../utils/errorManagement/tryCatch/failThrows500.js";
import type {TUserId} from "../../user/types/user.domain.types.js";


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