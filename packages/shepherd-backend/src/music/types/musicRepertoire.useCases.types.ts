import type {TUserId} from "../../user/types/user.domain.types.js";
import type {TUserRepertoireTableRow} from "./music.domain.types.js";

export type TMusicRepertoireUseCases = {
    getMusicRepertoireByUserId: TGetMusicRepertoireUseCaseFn;
}


export type TGetMusicRepertoireUseCaseFn = (requestDTO: {
    asker_user_id: TUserId;
    target_user_id: TUserId | TUserId[]
}) => Promise<Map<TUserId, TUserRepertoireTableRow[]>>;