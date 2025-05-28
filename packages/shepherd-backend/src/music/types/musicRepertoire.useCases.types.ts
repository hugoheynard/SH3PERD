import type {TUserId} from "../../user/types/user.domain.types.js";
import type {TUserRepertoireTableRow} from "./music.domain.types.js";

export type TMusicRepertoireUseCases = {
    getMusicRepertoireByUserId: TGetMusicRepertoireUseCaseFn;
}


export type TGetMusicRepertoireUseCaseFn = (requestDTO: {
    asker_user_id: TUserId | undefined;
    target_user_id: TUserId | TUserId[] | undefined;
}) => Promise<Map<TUserId, TUserRepertoireTableRow[]>>;