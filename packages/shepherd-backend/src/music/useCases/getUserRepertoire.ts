import {BusinessError} from "../../utils/errorManagement/errorClasses/BusinessError.js";
import type {TUserId} from "../../user/types/user.domain.types.js";

export const getUserRepertoireUseCase = (deps: {
    findUserRepertoireFn: (input: { user_id: TUserId }) => Promise<any>;
}) => {
    return async (request: { user_id : TUserId}): Promise<any> => {
        const { user_id } = request;

        if (!user_id) {
            throw new BusinessError('GET_USER_REPERTOIRE_FAILED', 'No user_id in request', 401);
        }

        console.log('getUserRepertoire Use Case called with user_id:', user_id);
        return await deps.findUserRepertoireFn({ user_id });
    }
}