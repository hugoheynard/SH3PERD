import {RegisterService} from "@sh3pherd/auth/dist/core/services/RegisterService";
import {generateTypedId} from "@sh3pherd/shared-utils";



export const createRegisterService = (input: {
    findUserByEmailFn: any;
    hashPasswordFn: any;
    createUserFn: any;
    saveUserFn: any;

}) => {

    return new RegisterService({
        generateUserIdFn: () => generateTypedId('user'),
        hashPasswordFn: input.hashPasswordFn,
        createUserFn: input.createUserFn,
        saveUserFn: input.saveUserFn,
        findUserByEmailFn: input.findUserByEmailFn,
    });
}