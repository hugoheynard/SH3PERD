import {validateAuthInput} from "../api/middlewares/validateAuthInput";

export const createAuthMiddlewares = (): any => {
    return {
        validateAuthInput: validateAuthInput
    }
}