import {ObjectId} from "mongodb";

export interface IDataInformation {
    dataInformations: {
        creation_date: Date;
        creator_id: ObjectId;
        last_modified: Date;
        updateNumber: number;
    }
}

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
    createDataInformationObject(input: { creator_id: ObjectId | string}): IDataInformation {
        if (input === undefined || input.creator_id === undefined || null) {
            throw new Error('[DataInformationManager -createDataInformationObject]:creator_id is required');
        }

        return {
            dataInformations: {
                creation_date: this.creation_date,
                creator_id: this.parseCreatorId(input.creator_id),
                last_modified: this.last_modified,
                updateNumber: this.updateNumber
            }
        }
    };

    /**
     * updates the DataInformation object with a timestamp and an update number.
     * @param input dataInformationObject
     * @returns DataInformation updated
     */
    updateDataInformation(input: { dataInformationObject: IDataInformation }): IDataInformation {
        if (!input) {
            throw new Error('[DataInformationManager -updateDataInformation]:dataInformationObject is required');
        }

        const { dataInformationObject } = input;

        return {
            dataInformations: {
                creation_date: dataInformationObject.dataInformations.creation_date,
                creator_id: this.parseCreatorId(dataInformationObject.dataInformations.creator_id),
                last_modified: new Date(),
                updateNumber: dataInformationObject.dataInformations.updateNumber + 1
            }
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

    /**
     * Manages the dataInformation object of a given object.
     * @param input object to manage and creator_id
     * @returns IDataInformation
     */
    manageDataInformation<T extends Record<string, any>>(input: { object: T; creator_id: ObjectId | string | null }): IDataInformation {
        const { object, creator_id } = input;

        if (!object || !creator_id) {
            throw new Error('[DataInformationManager - manageDataInformation]: object and creator_id are required');
        }

        if (object.hasOwnProperty('dataInformation')) {
            return this.updateDataInformation(
                { dataInformationObject: object.dataInformation }
            );
        }
        return this.createDataInformationObject(
            { creator_id: creator_id }
        );
    };
}