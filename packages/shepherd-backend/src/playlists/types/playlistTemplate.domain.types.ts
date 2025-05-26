import type {ObjectId} from "mongodb";

export interface TPlaylistTemplateDomainModel {
    _id: ObjectId;
    name: string;
    usage: 'daily' | 'event';
    requiredLength: number;
    numberOfSongs: number;
    performers: Performers;
}

interface BasePerformers {
}

interface SingersDisabled extends BasePerformers {
    singers: false;
    singersConfig?: never;
}

interface SingersEnabled extends BasePerformers {
    singers: true;
    singersConfig: {
        vocalType: string;
        experienceLevel: string;
    };
}

interface MusiciansDisabled {
    musicians: false;
    musiciansConfig?: never;
}

interface MusiciansEnabled {
    musicians: true;
    musiciansConfig: {
        role: "solo" | "support";
    };
}

interface AerialDisabled {
    aerial: false;
    aerialConfig?: never;
}

interface AerialEnabled {
    aerial: true;
    aerialConfig: {
        aerialPosition: "start" | "end" | "manual";
    }
}

type Performers =
    (SingersEnabled | SingersDisabled)
    & (MusiciansEnabled | MusiciansDisabled)
    & (AerialEnabled | AerialDisabled);