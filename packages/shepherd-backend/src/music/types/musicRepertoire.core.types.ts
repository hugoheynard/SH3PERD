import type {TUserId} from "../../user/types/user.domain.types.js";
import type {TUserRepertoireTableRow} from "./music.domain.types.js";


export type TMusicRepertoireByUserIdPipelineResult = { user_id: TUserId; repertoire: TUserRepertoireTableRow[] };

/**
 * MusicRepertoire Repository Core Types
 */
export type TFindMusicRepertoireByUserIdFn = (input: {
    user_id: TUserId | TUserId[]
}) => Promise<TMusicRepertoireByUserIdPipelineResult[]>;

// Repository interface for Music Repertoire
export interface IMusicRepertoireRepository {
    findRepertoireByUserId: TFindMusicRepertoireByUserIdFn;
}

