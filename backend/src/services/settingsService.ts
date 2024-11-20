import {Collection} from "mongodb";

export interface SettingsService {
    collection: Collection<any>;
}

export const settingsService = (collection: Collection<any>): SettingsService => {
    return {
        collection: collection,
    }

}