import type {ObjectId} from "mongodb";

export interface PlanningBlock {
    startDate: Date;
    endDate: Date;
    type: 'club' | 'show';
    containsPlaylist: boolean;
    playlist_id?: ObjectId | string;
    participants: string[];
    generated: boolean;
}