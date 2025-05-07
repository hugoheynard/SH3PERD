import {ObjectId} from "mongodb";
import type {TDataInformation} from "@sh3pherd/shared-types";



/**
 * DataInformation class
 * used to store information about the data:
 *  -> creation_date,
 *  -> creator_id
 *  -> last_modified,
 *  -> updateNumber
 */
export class DataInformationManager {
    private readonly creation_date: Date = new Date();
    private readonly creator_id: ObjectId | string | null = null;
    private readonly last_modified: Date = new Date();
    private readonly updateNumber: number = 0;

    /**
     * Creates a DataInformation object.
     * @returns IDataInformation
     */
    createDataInformationObject(input: { creator_id: ObjectId | string}): TDataInformation {
        if (!input || input.creator_id == null) {
            throw new Error('[DataInformationManager -createDataInformationObject]:creator_id is required');
        }

        return {
            creation_date: this.creation_date,
            creator_id: this.parseCreatorId(input.creator_id),
            last_modified: this.last_modified,
            updateNumber: this.updateNumber
        }
    };

    /**
     * updates the DataInformation object with a timestamp and an update number.
     * @param input dataInformationObject
     * @returns DataInformation updated
     */
    updateDataInformation(input: { dataInformationObject: TDataInformation }): TDataInformation {
        if (input === undefined || input.dataInformationObject === undefined) {
            throw new Error('[DataInformationManager -updateDataInformation]:dataInformationObject is required');
        }

        const { dataInformationObject } = input;

        return {
            creation_date: dataInformationObject.creation_date,
            creator_id: this.parseCreatorId(dataInformationObject.creator_id),
            last_modified: new Date(),
            updateNumber: dataInformationObject.updateNumber + 1
        }
    };

    /**
     * converts a string in ObjectId if necessary.
     * @param creator_id creator_id (ObjectId ou string).
     * @returns ObjectId
     * @throws Error if conversion fails.
     */
    private parseCreatorId(creator_id: ObjectId | string): ObjectId {
        if (!creator_id) {
            throw new Error("[DataInformationManager -createDataInformationObject]:creator_id is required");
        }

        if (typeof creator_id === 'string') {
            try {
                return new ObjectId(creator_id);
            } catch {
                throw new Error('Invalid creator_id format');
            }
        }
        return creator_id;
    };
}